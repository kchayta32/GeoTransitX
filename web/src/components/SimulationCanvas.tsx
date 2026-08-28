"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { SimulationData, SimulationTimelineStep, SimulationScenarioId, SimulationScenario } from "@/types";
import {
  Play,
  Pause,
  RotateCcw,
  Activity,
  Gauge,
  Flame,
  Car,
  Clock,
  ShieldAlert,
  Moon,
  Sun,
  Satellite,
  Layers,
  Eye,
  EyeOff,
  Sparkles,
  Sliders,
  MapPin,
  Compass,
  Zap,
  CloudRain,
  Plane,
  AlertTriangle,
  Radio
} from "lucide-react";

interface SimulationCanvasProps {
  simulationData: SimulationData | null;
  landUse?: any | null;
  runwayBuffer?: any | null;
  runwaySketch?: any | null;
  network?: any | null;
  parking?: any | null;
  detections?: any | null;
  onTimeChange?: (step: SimulationTimelineStep) => void;
}

type BasemapType = "google_satellite" | "google_hybrid" | "esri_satellite" | "carto_dark";

const SCENARIOS: SimulationScenario[] = [
  {
    id: "normal",
    name_th: "วันทำงานปกติ (Baseline Flow)",
    name_en: "Normal Weekday Baseline",
    icon: "☀️",
    description_th: "สภาพการจราจรเฉลี่ยในวันทำงานปกติ การไหลเวียนคล่องตัว มีชะลอตัวช่วงเร่งด่วนเช้าและเย็น",
    volume_multiplier: 1.0,
    speed_multiplier: 1.0,
    delay_multiplier: 1.0,
    co2_multiplier: 1.0,
    weather: "แดดจัด / ทัศนวิสัยดีเยี่ยม",
    tag_color: "#10B981"
  },
  {
    id: "rain",
    name_th: "ฝนตกหนักและน้ำท่วมขัง (Monsoon Surge)",
    name_en: "Heavy Rain & Waterlogging",
    icon: "🌧️",
    description_th: "ฝนตกหนักส่งผลให้ทัศนวิสัยลดลง ความเร็วลดลง 42% ดีเลย์สะสมเพิ่มขึ้น 115% วิกฤต LOS E/F",
    volume_multiplier: 0.92,
    speed_multiplier: 0.58,
    delay_multiplier: 2.15,
    co2_multiplier: 1.35,
    weather: "ฝนตกหนัก / ผิวทางลื่น",
    tag_color: "#06B6D4"
  },
  {
    id: "airshow",
    name_th: "งานนิทรรศการการบิน EEC (Airshow Peak)",
    name_en: "EEC Airshow & Aviation Expo",
    icon: "✈️",
    description_th: "มหกรรมการบินประจำปี มีผู้เข้าชมและเที่ยวบินหนาแน่น ปริมาณจราจรพุ่งสูง 185%",
    volume_multiplier: 1.85,
    speed_multiplier: 0.65,
    delay_multiplier: 2.40,
    co2_multiplier: 1.90,
    weather: "แจ่มใส / กิจกรรมภาคพื้นหนาแน่น",
    tag_color: "#A855F7"
  },
  {
    id: "maintenance",
    name_th: "ปิดซ่อมบำรุง Runway / ผิวทาง (Maintenance)",
    name_en: "Runway & Road Maintenance",
    icon: "🚧",
    description_th: "ปิดซ่อมบำรุงผิวทางแอสฟัลต์บางส่วน บีบช่องจราจรเหลือ 1 เลน เกิดคอขวดสะสม",
    volume_multiplier: 0.85,
    speed_multiplier: 0.50,
    delay_multiplier: 2.60,
    co2_multiplier: 1.45,
    weather: "เขตก่อสร้างซ่อมบำรุง",
    tag_color: "#F97316"
  },
  {
    id: "green_transit",
    name_th: "ระบบขนส่งไฟฟ้า Smart EV Feeder (Green Mobility)",
    name_en: "Green EV Transit & Smart Feeder",
    icon: "⚡",
    description_th: "ใช้งานรถบัสไฟฟ้า EV Shuttle เชื่อมต่อรถไฟความเร็วสูง EEC ลด CO2 ลง 65%",
    volume_multiplier: 0.78,
    speed_multiplier: 1.15,
    delay_multiplier: 0.60,
    co2_multiplier: 0.35,
    weather: "พลังงานสะอาดไร้มลพิษ",
    tag_color: "#10B981"
  }
];

export default function SimulationCanvas({
  simulationData,
  landUse,
  runwayBuffer,
  runwaySketch,
  network,
  parking,
  detections,
  onTimeChange
}: SimulationCanvasProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const basemapLayersRef = useRef<{ [key: string]: any }>({});
  const trafficLayerRef = useRef<any>(null);
  const agentMarkersLayerRef = useRef<any>(null);
  const chokepointLayerRef = useRef<any>(null);
  const orthophotoLayerRef = useRef<any>(null);

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(16); // Default around 08:00
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1x, 2x, 5x, 10x
  const [selectedScenario, setSelectedScenario] = useState<SimulationScenarioId>("normal");
  const [selectedBasemap, setSelectedBasemap] = useState<BasemapType>("google_satellite");
  const [orthoOpacity, setOrthoOpacity] = useState<number>(0.5);

  const [layerVisibility, setLayerVisibility] = useState({
    satelliteBasemap: true,
    orthophoto: true,
    liveTraffic: false,
    runwayBuffer: true,
    runwaySketch: true,
    roadNetwork: true,
    parking: true,
    agents: true,
    detections: false,
    chokepoints: true
  });

  const timeline = simulationData?.timeline || [];
  const rawStep = timeline[currentStepIndex] || timeline[0];

  // Scenario Multiplier Calculations
  const scenarioObj = SCENARIOS.find((s) => s.id === selectedScenario) || SCENARIOS[0];

  const currentStep: SimulationTimelineStep = rawStep
    ? {
        ...rawStep,
        volume_vph: Math.round(rawStep.volume_vph * scenarioObj.volume_multiplier),
        speed_kmh: Math.round(Math.max(6.0, rawStep.speed_kmh * scenarioObj.speed_multiplier) * 10) / 10,
        delay_seconds: Math.round(rawStep.delay_seconds * scenarioObj.delay_multiplier),
        co2_emissions_kgh: Math.round(rawStep.co2_emissions_kgh * scenarioObj.co2_multiplier * 10) / 10,
        los:
          rawStep.speed_kmh * scenarioObj.speed_multiplier >= 42
            ? "A"
            : rawStep.speed_kmh * scenarioObj.speed_multiplier >= 35
            ? "B"
            : rawStep.speed_kmh * scenarioObj.speed_multiplier >= 28
            ? "C"
            : rawStep.speed_kmh * scenarioObj.speed_multiplier >= 20
            ? "D"
            : rawStep.speed_kmh * scenarioObj.speed_multiplier >= 14
            ? "E"
            : "F",
        los_color:
          rawStep.speed_kmh * scenarioObj.speed_multiplier >= 42
            ? "#10B981"
            : rawStep.speed_kmh * scenarioObj.speed_multiplier >= 35
            ? "#34D399"
            : rawStep.speed_kmh * scenarioObj.speed_multiplier >= 28
            ? "#FBBF24"
            : rawStep.speed_kmh * scenarioObj.speed_multiplier >= 20
            ? "#F97316"
            : rawStep.speed_kmh * scenarioObj.speed_multiplier >= 14
            ? "#EF4444"
            : "#991B1B",
        status_th:
          rawStep.speed_kmh * scenarioObj.speed_multiplier >= 42
            ? "คล่องตัวสูงสุด (Free Flow)"
            : rawStep.speed_kmh * scenarioObj.speed_multiplier >= 35
            ? "คล่องตัวปกติ (Reasonably Free)"
            : rawStep.speed_kmh * scenarioObj.speed_multiplier >= 28
            ? "เริ่มชะลอตัว (Stable Flow)"
            : rawStep.speed_kmh * scenarioObj.speed_multiplier >= 20
            ? "หนาแน่นปานกลาง (Approaching Congestion)"
            : rawStep.speed_kmh * scenarioObj.speed_multiplier >= 14
            ? "ติดขัดหนาแน่น (Heavy Congestion)"
            : "ติดขัดวิกฤต (Forced Breakdown)"
      }
    : rawStep;

  // Callback to parent on step change
  useEffect(() => {
    if (currentStep && onTimeChange) {
      onTimeChange(currentStep);
    }
  }, [currentStepIndex, currentStep, onTimeChange]);

  // Simulation Animation Loop
  useEffect(() => {
    let interval: any = null;
    if (isPlaying && timeline.length > 0) {
      interval = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= timeline.length - 1) {
            return 0; // loop
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, timeline.length]);

  // 1. Initialize Interactive Leaflet Map on Google Satellite HD
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    import("leaflet").then((L) => {
      if (!isMounted) return;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
      });

      if (!mapInstanceRef.current && mapContainerRef.current) {
        const centerLat = 13.232422;
        const centerLon = 100.95519;

        const map = L.map(mapContainerRef.current, {
          center: [centerLat, centerLon],
          zoom: 17,
          minZoom: 13,
          maxZoom: 21,
          attributionControl: false
        });

        // 1. Setup Free Google Satellite HD & Other Basemaps
        basemapLayersRef.current = {
          google_satellite: L.tileLayer("https://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}", { maxZoom: 21 }),
          google_hybrid: L.tileLayer("https://mt0.google.com/vt/lyrs=y&x={x}&y={y}&z={z}", { maxZoom: 21 }),
          esri_satellite: L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            { maxZoom: 20 }
          ),
          carto_dark: L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", { maxZoom: 20 })
        };

        // Add Google Satellite as default
        basemapLayersRef.current.google_satellite.addTo(map);

        // 2. Real-Time Google Traffic Tile Layer Stream (Free)
        const trafficLayer = L.tileLayer(
          "https://mt0.google.com/vt/lyrs=m,traffic&x={x}&y={y}&z={z}&style=15",
          { maxZoom: 21, opacity: 0.85, zIndex: 350 }
        );
        trafficLayerRef.current = trafficLayer;

        // 3. Drone Orthophoto Overlay (GSD 2.62cm)
        const bounds: [[number, number], [number, number]] = [
          [13.230275, 100.953076],
          [13.2346, 100.957303]
        ];
        const orthophotoOverlay = L.imageOverlay("/data/orthophoto_web.png", bounds, {
          opacity: orthoOpacity,
          interactive: false,
          zIndex: 200
        }).addTo(map);
        orthophotoLayerRef.current = orthophotoOverlay;

        // 4. Runway Buffer Safety Zone
        const bufferLayerGroup = L.layerGroup().addTo(map);
        const bufferCoords: [number, number][] = [
          [13.2300, 100.9532],
          [13.2348, 100.9575],
          [13.2354, 100.9568],
          [13.2306, 100.9525]
        ];
        const bufferPoly = L.polygon(bufferCoords, {
          color: "#ef4444",
          weight: 2,
          fillColor: "#ef4444",
          fillOpacity: 0.18,
          dashArray: "6, 4"
        });
        bufferPoly.bindTooltip(
          "🛡️ <b>เขตความปลอดภัยทางวิ่ง (WebODM Runway Safety Buffer: 145,056 m²)</b><br/>ICAO Annex 14 Safety Clearance Zone",
          { sticky: true }
        );
        bufferLayerGroup.addLayer(bufferPoly);

        // 5. Runway 03/21 Centerline
        const runwayLayerGroup = L.layerGroup().addTo(map);
        const rwLine = L.polyline(
          [
            [13.2303, 100.9535],
            [13.2345, 100.9568]
          ],
          {
            color: "#38bdf8",
            weight: 5,
            dashArray: "10, 8",
            opacity: 0.9
          }
        );
        rwLine.bindTooltip("✈️ <b>ทางวิ่งหลัก Runway 03/21</b> (ความยาว 926.87 ม.)", { sticky: true });
        runwayLayerGroup.addLayer(rwLine);

        // 6. Road Network Lines
        const roadLayerGroup = L.layerGroup().addTo(map);
        const roadPoints: [number, number][] = [
          [13.2305, 100.9532],
          [13.2316, 100.9541],
          [13.2323, 100.9548],
          [13.2329, 100.9555]
        ];
        const roadLine = L.polyline(roadPoints, {
          color: "#fbbf24",
          weight: 4,
          opacity: 0.85
        });
        roadLine.bindTooltip("🚗 <b>ถนนทางเข้าหลักสนามบินบางพระ (Access Boulevard)</b>", { sticky: true });
        roadLayerGroup.addLayer(roadLine);

        // 7. Layer Groups for Moving Dynamic Agents & Chokepoint Pulses
        agentMarkersLayerRef.current = L.layerGroup().addTo(map);
        chokepointLayerRef.current = L.layerGroup().addTo(map);

        mapInstanceRef.current = map;
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Update Orthophoto Opacity
  useEffect(() => {
    if (orthophotoLayerRef.current) {
      orthophotoLayerRef.current.setOpacity(orthoOpacity);
    }
  }, [orthoOpacity]);

  // Basemap Switch Handler
  const switchBasemap = (type: BasemapType) => {
    const map = mapInstanceRef.current;
    if (!map || !basemapLayersRef.current) return;

    Object.values(basemapLayersRef.current).forEach((l: any) => {
      if (map.hasLayer(l)) map.removeLayer(l);
    });

    if (basemapLayersRef.current[type]) {
      basemapLayersRef.current[type].addTo(map);
      basemapLayersRef.current[type].bringToBack();
      setSelectedBasemap(type);
    }
  };

  // Toggle Live Traffic Overlay
  const toggleLiveTraffic = () => {
    const map = mapInstanceRef.current;
    if (!map || !trafficLayerRef.current) return;

    const nextState = !layerVisibility.liveTraffic;
    setLayerVisibility((prev) => ({ ...prev, liveTraffic: nextState }));

    if (nextState) {
      map.addLayer(trafficLayerRef.current);
    } else {
      map.removeLayer(trafficLayerRef.current);
    }
  };

  // 2. Render Moving Dynamic Agents & Chokepoints onto Google Satellite HD
  useEffect(() => {
    const map = mapInstanceRef.current;
    const agentGroup = agentMarkersLayerRef.current;
    const chokepointGroup = chokepointLayerRef.current;

    if (!map || !agentGroup || !currentStep) return;

    import("leaflet").then((L) => {
      agentGroup.clearLayers();
      if (chokepointGroup) chokepointGroup.clearLayers();

      const agents = currentStep.active_agents || [];

      // Render Active Dynamic Vehicles
      agents.forEach((agent) => {
        let color = "#3b82f6";
        let radius = 6;
        let labelIcon = "🚗";

        if (agent.type === "airplane") {
          color = "#c084fc";
          radius = 10;
          labelIcon = "✈️";
        } else if (agent.type === "ev_shuttle") {
          color = "#10b981";
          radius = 8;
          labelIcon = "⚡";
        } else if (agent.type === "bus") {
          color = "#eab308";
          radius = 7.5;
          labelIcon = "🚌";
        } else if (agent.type === "truck") {
          color = "#f97316";
          radius = 7;
          labelIcon = "🚚";
        }

        if (agent.in_runway_buffer && agent.type !== "airplane") {
          color = "#ef4444";
        }

        // Custom HTML Marker with Pulsing Glow & Vehicle Icon
        const iconHtml = `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: ${color};
            box-shadow: 0 0 12px ${color}, 0 0 4px #000;
            border: 2px solid #ffffff;
            color: #ffffff;
            font-size: 13px;
            transform: rotate(${agent.heading || 0}deg);
            transition: all 0.2s ease-out;
          ">
            ${labelIcon}
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: "custom-agent-marker",
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const marker = L.marker([agent.lat, agent.lon], { icon: customIcon });

        marker.bindTooltip(
          `<b>${agent.id}</b> (${agent.type.toUpperCase()})<br/>
          ความเร็ว: <b style="color:${color}">${agent.speed_kmh} กม./ชม.</b><br/>
          เส้นทาง: ${agent.route_name || agent.route_id}<br/>
          ${
            agent.in_runway_buffer
              ? '<span style="color:#ef4444;font-weight:bold;">⚠️ อยู่ในเขต Runway Safety Buffer!</span>'
              : '<span style="color:#10b981;">✓ ปลอดภัยตามพิกัด</span>'
          }`,
          { sticky: true }
        );

        agentGroup.addLayer(marker);
      });

      // Render Chokepoint Warning Halos during Heavy Traffic / Peak
      if (chokepointGroup && (currentStep.los === "E" || currentStep.los === "F")) {
        const chokeCircle = L.circle([13.2323, 100.9548], {
          radius: 45,
          color: "#ef4444",
          weight: 2,
          fillColor: "#ef4444",
          fillOpacity: 0.35,
          dashArray: "4, 4"
        });
        chokeCircle.bindTooltip(
          "⚠️ <b>จุดคอขวดวิกฤต (Critical Bottleneck Chokepoint)</b><br/>อัตราดีเลย์สะสมสูงสุด แนะนำเปิดเลนพิเศษ Dynamic Feeder",
          { sticky: true }
        );
        chokepointGroup.addLayer(chokeCircle);
      }
    });
  }, [currentStep]);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* 1. Top Header & Scenario Injection Selector */}
      <div className="bg-slate-900/95 border border-slate-800 p-4 rounded-xl shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 text-white shadow-lg shadow-emerald-950/60">
              <Satellite className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-100 text-sm">
                  แบบจำลองการจราจร 24 ชม. บนแผนที่ดาวเทียมจริง (Google Satellite HD Simulation)
                </h3>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-700 px-2.5 py-0.5 rounded-full font-mono font-bold">
                  Free HD Sat Stream + AI
                </span>
              </div>
              <p className="text-xs text-slate-400">
                เวลาจำลอง: <span className="text-emerald-400 font-bold font-mono text-sm">{currentStep?.time} น.</span> |
                ระดับการให้บริการ:{" "}
                <span className="font-bold font-mono px-2 py-0.5 rounded text-xs" style={{ color: currentStep?.los_color }}>
                  LOS {currentStep?.los} ({currentStep?.status_th})
                </span>
              </p>
            </div>
          </div>

          {/* Quick Jump Buttons to Critical Hours */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-slate-400 font-medium mr-1">ลัดเวลา:</span>
            <button
              onClick={() => {
                const idx = timeline.findIndex((t) => t.time === "02:00");
                if (idx !== -1) setCurrentStepIndex(idx);
              }}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 font-mono flex items-center gap-1 transition"
            >
              <Moon className="w-3 h-3 text-indigo-400" /> 02:00
            </button>
            <button
              onClick={() => {
                const idx = timeline.findIndex((t) => t.time === "08:00");
                if (idx !== -1) setCurrentStepIndex(idx);
              }}
              className="px-2 py-1 bg-amber-950/70 hover:bg-amber-900 text-amber-300 rounded border border-amber-800 font-mono flex items-center gap-1 transition"
            >
              <Sun className="w-3 h-3 text-amber-400" /> 08:00
            </button>
            <button
              onClick={() => {
                const idx = timeline.findIndex((t) => t.time === "12:30");
                if (idx !== -1) setCurrentStepIndex(idx);
              }}
              className="px-2 py-1 bg-blue-950/70 hover:bg-blue-900 text-blue-300 rounded border border-blue-800 font-mono flex items-center gap-1 transition"
            >
              ✈️ 12:30
            </button>
            <button
              onClick={() => {
                const idx = timeline.findIndex((t) => t.time === "17:30");
                if (idx !== -1) setCurrentStepIndex(idx);
              }}
              className="px-2 py-1 bg-red-950/80 hover:bg-red-900 text-red-300 rounded border border-red-800 font-mono flex items-center gap-1 transition font-bold animate-pulse"
            >
              🚨 17:30 (Peak)
            </button>
          </div>
        </div>

        {/* Scenario Injection Tabs */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mr-1">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>จำลองสถานการณ์ (Scenario):</span>
          </span>

          {SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              onClick={() => setSelectedScenario(sc.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 border ${
                selectedScenario === sc.id
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-md shadow-emerald-950/50 scale-[1.02]"
                  : "bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200"
              }`}
            >
              <span>{sc.icon}</span>
              <span>{sc.name_th}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Main Google Satellite HD Map Simulation Canvas */}
      <div className="relative w-full h-[640px] rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-2xl">
        {/* Leaflet Map Canvas */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Top Left: GIS Layer Controls & Basemap Switcher */}
        <div className="absolute top-4 left-4 z-10 bg-slate-900/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-750 shadow-2xl text-xs space-y-2.5 max-w-xs">
          <div className="flex items-center justify-between font-bold text-slate-200 border-b border-slate-800 pb-1.5">
            <div className="flex items-center gap-1.5">
              <Satellite className="w-4 h-4 text-cyan-400" />
              <span>Google Satellite HD Basemap</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">สายฟรี 100%</span>
          </div>

          {/* Basemap Selection */}
          <div className="grid grid-cols-2 gap-1 font-mono text-[10px]">
            <button
              onClick={() => switchBasemap("google_satellite")}
              className={`px-2 py-1.5 rounded text-left transition border ${
                selectedBasemap === "google_satellite"
                  ? "bg-cyan-950 text-cyan-300 border-cyan-500 font-bold"
                  : "bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200"
              }`}
            >
              🛰️ Google Sat HD
            </button>
            <button
              onClick={() => switchBasemap("google_hybrid")}
              className={`px-2 py-1.5 rounded text-left transition border ${
                selectedBasemap === "google_hybrid"
                  ? "bg-cyan-950 text-cyan-300 border-cyan-500 font-bold"
                  : "bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200"
              }`}
            >
              🌍 Google Hybrid
            </button>
            <button
              onClick={() => switchBasemap("esri_satellite")}
              className={`px-2 py-1.5 rounded text-left transition border ${
                selectedBasemap === "esri_satellite"
                  ? "bg-cyan-950 text-cyan-300 border-cyan-500 font-bold"
                  : "bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200"
              }`}
            >
              🗺️ Esri Sat
            </button>
            <button
              onClick={() => switchBasemap("carto_dark")}
              className={`px-2 py-1.5 rounded text-left transition border ${
                selectedBasemap === "carto_dark"
                  ? "bg-cyan-950 text-cyan-300 border-cyan-500 font-bold"
                  : "bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200"
              }`}
            >
              🌃 Carto Dark
            </button>
          </div>

          {/* Real-time Google Live Traffic Toggle */}
          <button
            onClick={toggleLiveTraffic}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border transition ${
              layerVisibility.liveTraffic
                ? "bg-emerald-950 text-emerald-300 border-emerald-600 shadow"
                : "bg-slate-800 text-slate-400 border-slate-700"
            }`}
          >
            <span className="flex items-center gap-1.5 font-semibold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>🚦 Real-Time Live Traffic</span>
            </span>
            {layerVisibility.liveTraffic ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>

          {/* Drone Orthophoto Opacity Slider */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>ความโปร่งใสภาพโดรน WebODM:</span>
              <span className="font-mono text-emerald-400">{Math.round(orthoOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={orthoOpacity}
              onChange={(e) => setOrthoOpacity(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>

        {/* Top Right: Telemetry HUD */}
        <div className="absolute top-4 right-4 z-10 bg-slate-900/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-750 shadow-2xl w-64 text-xs space-y-2 pointer-events-none">
          <div className="flex justify-between items-center text-slate-300 border-b border-slate-800 pb-1.5">
            <span className="font-semibold flex items-center gap-1 text-slate-400">
              <Car className="w-3.5 h-3.5 text-blue-400" /> ปริมาณจราจร
            </span>
            <span className="font-bold font-mono text-sm text-blue-400">{currentStep?.volume_vph} vph</span>
          </div>

          <div className="flex justify-between items-center text-slate-300 border-b border-slate-800 pb-1.5">
            <span className="font-semibold flex items-center gap-1 text-slate-400">
              <Gauge className="w-3.5 h-3.5 text-emerald-400" /> ความเร็วเฉลี่ย
            </span>
            <span className="font-bold font-mono text-sm text-emerald-400">{currentStep?.speed_kmh} กม./ชม.</span>
          </div>

          <div className="flex justify-between items-center text-slate-300 border-b border-slate-800 pb-1.5">
            <span className="font-semibold flex items-center gap-1 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> ดีเลย์สะสม
            </span>
            <span className="font-bold font-mono text-sm text-amber-400">{currentStep?.delay_seconds} วินาที</span>
          </div>

          <div className="flex justify-between items-center text-slate-300 border-b border-slate-800 pb-1.5">
            <span className="font-semibold flex items-center gap-1 text-slate-400">
              <Flame className="w-3.5 h-3.5 text-red-400" /> การปล่อย CO2
            </span>
            <span className="font-bold font-mono text-sm text-red-400">{currentStep?.co2_emissions_kgh} kg/h</span>
          </div>

          <div className="flex justify-between items-center text-slate-300">
            <span className="font-semibold flex items-center gap-1 text-slate-400">
              <Activity className="w-3.5 h-3.5 text-purple-400" /> ระดับ LOS
            </span>
            <span className="font-bold font-mono text-sm px-1.5 rounded" style={{ color: currentStep?.los_color }}>
              LOS {currentStep?.los}
            </span>
          </div>
        </div>

        {/* Safety Zone Alert Overlay */}
        {currentStep?.runway_buffer_intrusion_alert && (
          <div className="absolute bottom-4 right-4 z-10 bg-red-950/95 backdrop-blur-md border border-red-700 p-3 rounded-xl text-xs text-red-200 max-w-sm shadow-2xl flex items-start gap-2.5 animate-pulse">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-red-100">⚠️ ตรวจพบยานพาหนะใน Runway Safety Buffer</div>
              <p className="text-[11px] text-red-300 mt-0.5">
                มียานพาหนะเข้าสู่เขตความปลอดภัยทางวิ่ง 145,056 m² ระบบส่งสัญญาณเตือนเจ้าหน้าที่หอบังคับการบิน
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 3. 24-Hour Playback Scrubber & Speed Controls */}
      <div className="bg-slate-900/95 border border-slate-800 p-4 rounded-xl shadow-xl space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-950/50"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? "พักจำลอง (Pause)" : "เริ่มเล่นจำลอง 24 ชม. (Play)"}</span>
            </button>

            <button
              onClick={() => setCurrentStepIndex(0)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="เริ่มใหม่ตั้งแต่ 00:00"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Playback Speed Multipliers */}
            <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700">
              {[1, 2, 5, 10].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition ${
                    playbackSpeed === spd
                      ? "bg-emerald-600 text-white font-bold shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          <div className="font-mono text-xs flex items-center gap-2">
            <span className="text-slate-400">สถานการณ์:</span>
            <span className="text-emerald-400 font-bold">{scenarioObj.name_th}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">เวลา:</span>
            <span className="text-emerald-400 font-bold text-sm">{currentStep?.time}</span> / 23:30 น.
          </div>
        </div>

        {/* 24-Hour Scrubber Range */}
        <div className="space-y-1">
          <input
            type="range"
            min="0"
            max={Math.max(0, timeline.length - 1)}
            value={currentStepIndex}
            onChange={(e) => {
              setCurrentStepIndex(parseInt(e.target.value));
              if (isPlaying) setIsPlaying(false);
            }}
            className="w-full h-2.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-0.5">
            <span>00:00 (เที่ยงคืน)</span>
            <span>06:00 (เช้า)</span>
            <span className="text-amber-400 font-bold">08:00 (Peak เช้า 860 vph)</span>
            <span>12:30 (การบิน)</span>
            <span className="text-red-400 font-bold">17:30 (Peak เย็น 940 vph)</span>
            <span>21:00 (ค่ำ)</span>
            <span>23:30 (ดึก)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

