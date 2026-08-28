"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { DatasetMetadata } from "@/types";
import {
  Layers,
  Eye,
  EyeOff,
  MapPin,
  Car,
  Plane,
  Navigation,
  ShieldCheck,
  ShieldAlert,
  Info,
  Radio,
  RefreshCw,
  Trees,
  Building2,
  Wheat,
  Droplets,
  HelpCircle,
  Satellite
} from "lucide-react";

interface MapViewProps {
  metadata: DatasetMetadata | null;
  detections: any | null;
  network: any | null;
  parking: any | null;
  gcps: any | null;
  landUse?: any | null;
  runwayBuffer?: any | null;
  runwaySketch?: any | null;
}

type BasemapType = "google_hybrid" | "google_satellite" | "google_streets" | "esri_satellite" | "carto_dark" | "osm";

export default function MapView({
  metadata,
  detections,
  network,
  parking,
  gcps,
  landUse,
  runwayBuffer,
  runwaySketch,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layersRef = useRef<{ [key: string]: any }>({});
  const basemapLayersRef = useRef<{ [key: string]: any }>({});
  const trafficLayerRef = useRef<any>(null);

  const [opacity, setOpacity] = useState<number>(0.85);
  const [selectedBasemap, setSelectedBasemap] = useState<BasemapType>("google_hybrid");
  const [liveTrafficActive, setLiveTrafficActive] = useState<boolean>(true);
  const [lastTrafficUpdate, setLastTrafficUpdate] = useState<string>(new Date().toLocaleTimeString());

  const [activeLayers, setActiveLayers] = useState({
    orthophoto: true,
    liveTraffic: true,
    landUse: true,
    runwayBuffer: true,
    runwaySketch: true,
    detections: true,
    network: true,
    parking: true,
    gcps: true,
  });

  const [landUseFilters, setLandUseFilters] = useState<{ [cat: string]: boolean }>({
    u: true, // Urban
    a: true, // Agriculture
    f: true, // Forest
    w: true, // Water
    m: true, // Misc
  });

  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [filterClass, setFilterClass] = useState<string>("all");

  // Helper for Land Use Category Colors
  const getLandUseStyle = (code: string) => {
    switch (code) {
      case "u":
        return { color: "#f59e0b", name: "ย่านเมือง/โครงสร้างพื้นฐาน (Urban)", fill: "#f59e0b", opacity: 0.4 };
      case "a":
        return { color: "#84cc16", name: "พื้นที่เกษตรกรรม (Agri)", fill: "#84cc16", opacity: 0.35 };
      case "f":
        return { color: "#10b981", name: "ป่าไม้/พื้นที่อนุรักษ์ (Forest)", fill: "#10b981", opacity: 0.4 };
      case "w":
        return { color: "#06b6d4", name: "แหล่งน้ำ (Water Bodies)", fill: "#06b6d4", opacity: 0.45 };
      case "m":
      default:
        return { color: "#a855f7", name: "พื้นที่เบ็ดเตล็ด (Misc)", fill: "#a855f7", opacity: 0.35 };
    }
  };

  // Initialize and Update Leaflet Map
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    import("leaflet").then((L) => {
      if (!isMounted) return;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!mapInstanceRef.current && mapContainerRef.current) {
        const centerLat = metadata?.georeferencing?.center_wgs84?.[0] || 13.232422;
        const centerLon = metadata?.georeferencing?.center_wgs84?.[1] || 100.955190;

        const map = L.map(mapContainerRef.current, {
          center: [centerLat, centerLon],
          zoom: 17,
          minZoom: 13,
          maxZoom: 21,
          attributionControl: false,
        });

        // 1. Setup Free Basemaps
        basemapLayersRef.current = {
          google_hybrid: L.tileLayer("https://mt0.google.com/vt/lyrs=y&x={x}&y={y}&z={z}", { maxZoom: 21 }),
          google_satellite: L.tileLayer("https://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}", { maxZoom: 21 }),
          google_streets: L.tileLayer("https://mt0.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", { maxZoom: 21 }),
          esri_satellite: L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            { maxZoom: 20 }
          ),
          carto_dark: L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", { maxZoom: 20 }),
          osm: L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }),
        };

        // Add initial basemap
        basemapLayersRef.current.google_hybrid.addTo(map);

        // 2. Setup Real-time Live Traffic Overlay (Free Google Traffic Tile Stream)
        const trafficLayer = L.tileLayer(
          "https://mt0.google.com/vt/lyrs=m,traffic&x={x}&y={y}&z={z}&style=15",
          {
            maxZoom: 21,
            opacity: 0.85,
            zIndex: 350,
          }
        );
        trafficLayer.addTo(map);
        trafficLayerRef.current = trafficLayer;
        layersRef.current.liveTraffic = trafficLayer;

        // 3. Drone Orthophoto Overlay (High Resolution GeoTIFF Web Export)
        const bounds = metadata?.georeferencing?.bounds_wgs84 || [
          [13.230275, 100.953076],
          [13.234600, 100.957303],
        ];

        const orthophotoOverlay = L.imageOverlay("/data/orthophoto_web.png", bounds, {
          opacity: opacity,
          interactive: false,
          zIndex: 200,
        }).addTo(map);
        layersRef.current.orthophoto = orthophotoOverlay;

        // 4. WebODM Land Use Classification Polygons (u, a, f, w, m)
        const landUseLayerGroup = L.layerGroup().addTo(map);
        layersRef.current.landUse = landUseLayerGroup;

        // 5. WebODM Runway Safety Buffer Zone
        const runwayBufferGroup = L.layerGroup().addTo(map);
        layersRef.current.runwayBuffer = runwayBufferGroup;

        // 6. WebODM Runway Centerline & Sketches
        const runwaySketchGroup = L.layerGroup().addTo(map);
        layersRef.current.runwaySketch = runwaySketchGroup;

        // 7. Parking & Service Zones
        const parkingLayerGroup = L.layerGroup().addTo(map);
        layersRef.current.parking = parkingLayerGroup;

        // 8. Road Network Layer
        const networkLayerGroup = L.layerGroup().addTo(map);
        layersRef.current.network = networkLayerGroup;

        // 9. GCP Layer
        const gcpLayerGroup = L.layerGroup().addTo(map);
        layersRef.current.gcps = gcpLayerGroup;

        // 10. GeoAI Detections (YOLO) with Segmentation Polygons
        const detectionLayerGroup = L.layerGroup().addTo(map);
        layersRef.current.detections = detectionLayerGroup;

        mapInstanceRef.current = map;
      }

      // Populate WebODM Land Use Polygons
      const luGroup = layersRef.current.landUse;
      if (luGroup) {
        luGroup.clearLayers();
        if (landUse?.features) {
          landUse.features.forEach((feat: any) => {
            const props = feat.properties || {};
            const cat = (props.category_code || props.type || "m").toLowerCase();
            if (!landUseFilters[cat]) return; // filtered out

            const style = getLandUseStyle(cat);
            const geom = feat.geometry;

            if (geom.type === "Polygon") {
              const latlngs = geom.coordinates[0].map((coord: number[]) => [coord[1], coord[0]]);
              const poly = L.polygon(latlngs, {
                color: style.color,
                weight: 1.5,
                fillColor: style.fill,
                fillOpacity: style.opacity,
                dashArray: "3, 3",
              });
              poly.on("click", () => setSelectedFeature({ type: "land_use", data: props }));
              poly.bindTooltip(
                `<b>${props.name || "Land Parcel"}</b> (${props.category_name_th || style.name})<br/>พื้นที่: ${props.area_sq_m || props.area} ตร.ม. (${props.area_rai || (props.area / 1600).toFixed(2)} ไร่)`,
                { sticky: true }
              );
              luGroup.addLayer(poly);
            } else if (geom.type === "MultiPolygon") {
              geom.coordinates.forEach((polyCoords: any[]) => {
                const latlngs = polyCoords[0].map((coord: number[]) => [coord[1], coord[0]]);
                const poly = L.polygon(latlngs, {
                  color: style.color,
                  weight: 1.5,
                  fillColor: style.fill,
                  fillOpacity: style.opacity,
                  dashArray: "3, 3",
                });
                poly.on("click", () => setSelectedFeature({ type: "land_use", data: props }));
                poly.bindTooltip(
                  `<b>${props.name || "Land Parcel"}</b> (${props.category_name_th || style.name})<br/>พื้นที่: ${props.area_sq_m || props.area} ตร.ม. (${props.area_rai || (props.area / 1600).toFixed(2)} ไร่)`,
                  { sticky: true }
                );
                luGroup.addLayer(poly);
              });
            }
          });
        }
      }

      // Populate Runway Buffer Safety Zone
      const bufGroup = layersRef.current.runwayBuffer;
      if (bufGroup) {
        bufGroup.clearLayers();
        if (runwayBuffer?.features) {
          runwayBuffer.features.forEach((feat: any) => {
            const props = feat.properties || {};
            const latlngs = feat.geometry.coordinates[0].map((coord: number[]) => [coord[1], coord[0]]);
            const poly = L.polygon(latlngs, {
              color: "#ef4444",
              weight: 2,
              fillColor: "#ef4444",
              fillOpacity: 0.2,
              dashArray: "6, 4",
            });
            poly.on("click", () => setSelectedFeature({ type: "runway_buffer", data: props }));
            poly.bindTooltip(
              `⚠️ <b>${props.name || "เขตความปลอดภัยทางวิ่ง (Runway Buffer)"}</b><br/>ความยาว: ${props.length} ม. | พื้นที่: ${props.area?.toLocaleString()} ตร.ม.`,
              { sticky: true }
            );
            bufGroup.addLayer(poly);
          });
        }
      }

      // Populate Runway Centerline Sketches
      const rwSketchGroup = layersRef.current.runwaySketch;
      if (rwSketchGroup) {
        rwSketchGroup.clearLayers();
        if (runwaySketch?.features) {
          runwaySketch.features.forEach((feat: any) => {
            const props = feat.properties || {};
            const latlngs = feat.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);
            const line = L.polyline(latlngs, {
              color: "#38bdf8",
              weight: 4,
              dashArray: "8, 6",
            });
            line.on("click", () => setSelectedFeature({ type: "runway_sketch", data: props }));
            line.bindTooltip(
              `✈️ <b>ทางวิ่งหลัก (${props.runway_id || "RW-03/21"})</b><br/>ความยาว: ${props.length} ม.`,
              { sticky: true }
            );
            rwSketchGroup.addLayer(line);
          });
        }
      }

      // Populate Parking
      const pkgGroup = layersRef.current.parking;
      if (pkgGroup) {
        pkgGroup.clearLayers();
        if (parking?.features) {
          parking.features.forEach((feat: any) => {
            const occ = feat.properties.occupancy_rate_pct;
            const color = occ > 80 ? "#ef4444" : occ > 50 ? "#f59e0b" : "#10b981";
            const poly = L.polygon(
              feat.geometry.coordinates[0].map((coord: number[]) => [coord[1], coord[0]]),
              {
                color: color,
                weight: 2,
                fillColor: color,
                fillOpacity: 0.35,
              }
            );
            poly.on("click", () => setSelectedFeature({ type: "parking", data: feat.properties }));
            poly.bindTooltip(
              `<b>${feat.properties.name}</b><br/>ความจุ: ${feat.properties.occupied_spots}/${feat.properties.total_capacity} คัน (${occ}%)`,
              { sticky: true }
            );
            pkgGroup.addLayer(poly);
          });
        }
      }

      // Populate Road Network
      const netGroup = layersRef.current.network;
      if (netGroup) {
        netGroup.clearLayers();
        if (network?.features) {
          network.features.forEach((feat: any) => {
            const isRunway = feat.properties.road_type.includes("Runway");
            const isTaxiway = feat.properties.road_type.includes("Taxiway");
            const color = isRunway ? "#ec4899" : isTaxiway ? "#8b5cf6" : "#3b82f6";
            const line = L.polyline(
              feat.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]),
              {
                color: color,
                weight: isRunway ? 5 : 3,
                dashArray: isRunway ? "8, 8" : undefined,
                opacity: 0.85,
              }
            );
            line.on("click", () => setSelectedFeature({ type: "road", data: feat.properties }));
            line.bindTooltip(
              `<b>${feat.properties.name}</b><br/>ประเภท: ${feat.properties.road_type}<br/>ความจุ: ${feat.properties.capacity_vph} คัน/ชม.`,
              { sticky: true }
            );
            netGroup.addLayer(line);
          });
        }
      }

      // Populate GCPs
      const gcpGroup = layersRef.current.gcps;
      if (gcpGroup) {
        gcpGroup.clearLayers();
        if (gcps?.features) {
          gcps.features.forEach((feat: any) => {
            const [lon, lat] = feat.geometry.coordinates;
            const marker = L.circleMarker([lat, lon], {
              radius: 9,
              fillColor: "#ef4444",
              color: "#ffffff",
              weight: 2,
              opacity: 1,
              fillOpacity: 0.9,
            });
            marker.on("click", () => setSelectedFeature({ type: "gcp", data: feat.properties }));
            marker.bindTooltip(
              `<b>GCP ID: ${feat.properties.id}</b><br/>ความคลาดเคลื่อน 3D: ${feat.properties.total_3d_error_mm} มม.<br/>สถานะ: ${feat.properties.status}`,
              { sticky: true }
            );
            gcpGroup.addLayer(marker);
          });
        }
      }

      // Populate GeoAI Detections (YOLO Seg & Box)
      const detGroup = layersRef.current.detections;
      if (detGroup) {
        detGroup.clearLayers();
        if (detections?.features) {
          detections.features.forEach((feat: any) => {
            const [lon, lat] = feat.geometry.coordinates;
            const cls = feat.properties.class;
            const riskAlert = feat.properties.risk_alert;
            const inSafetyBuffer = feat.properties.in_runway_safety_buffer;

            if (filterClass !== "all" && cls !== filterClass) return;

            let iconColor = "#3b82f6";
            let radius = 6;
            if (cls === "airplane") {
              iconColor = "#a855f7";
              radius = 9;
            } else if (cls === "truck") {
              iconColor = "#f97316";
              radius = 7;
            } else if (cls === "bus") {
              iconColor = "#eab308";
              radius = 8;
            } else if (cls === "person") {
              iconColor = "#10b981";
              radius = 4;
            }

            if (riskAlert === "RUNWAY_BUFFER_INTRUSION_WARNING") {
              iconColor = "#ef4444";
            }

            const marker = L.circleMarker([lat, lon], {
              radius: radius,
              fillColor: iconColor,
              color: riskAlert === "RUNWAY_BUFFER_INTRUSION_WARNING" ? "#fef08a" : "#ffffff",
              weight: riskAlert === "RUNWAY_BUFFER_INTRUSION_WARNING" ? 2.5 : 1.5,
              opacity: 1,
              fillOpacity: 0.9,
            });

            // Draw Segmentation Polygon or Bounding Box
            const polyCoords = feat.properties.segmentation_polygon || feat.properties.bbox_polygon;
            if (polyCoords && polyCoords.length > 2) {
              const poly = L.polygon(
                polyCoords.map((c: number[]) => [c[1], c[0]]),
                {
                  color: iconColor,
                  weight: 1.5,
                  fillColor: iconColor,
                  fillOpacity: feat.properties.has_segmentation ? 0.35 : 0.15,
                }
              );
              detGroup.addLayer(poly);
            }

            marker.on("click", () => setSelectedFeature({ type: "detection", data: feat.properties }));
            marker.bindTooltip(
              `<b>${feat.properties.object_id}</b> (${cls})<br/>โมเดล: ${feat.properties.model_source || "YOLO"}<br/>ความเชื่อมั่น: ${(feat.properties.confidence * 100).toFixed(1)}%${
                riskAlert === "RUNWAY_BUFFER_INTRUSION_WARNING" ? "<br/><span style='color:#ef4444;font-weight:bold;'>⚠️ เสี่ยงรุกล้ำ Runway Buffer</span>" : ""
              }`,
              { sticky: true }
            );
            detGroup.addLayer(marker);
          });
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [metadata, detections, network, parking, gcps, landUse, runwayBuffer, runwaySketch, landUseFilters, filterClass]);

  // Handle Basemap Switch
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

  // Real-time Traffic Auto-Refresh (Every 30 seconds)
  const refreshTraffic = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (trafficLayerRef.current && map.hasLayer(trafficLayerRef.current)) {
      map.removeLayer(trafficLayerRef.current);
    }

    import("leaflet").then((L) => {
      const ts = Date.now();
      const newTraffic = L.tileLayer(
        `https://mt0.google.com/vt/lyrs=m,traffic&x={x}&y={y}&z={z}&style=15&_t=${ts}`,
        {
          maxZoom: 21,
          opacity: 0.85,
          zIndex: 350,
        }
      );
      if (activeLayers.liveTraffic) {
        newTraffic.addTo(map);
      }
      trafficLayerRef.current = newTraffic;
      layersRef.current.liveTraffic = newTraffic;
      setLastTrafficUpdate(new Date().toLocaleTimeString());
    });
  }, [activeLayers.liveTraffic]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (activeLayers.liveTraffic) {
        refreshTraffic();
      }
    }, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, [activeLayers.liveTraffic, refreshTraffic]);

  // Handle Opacity Slider
  useEffect(() => {
    if (layersRef.current.orthophoto) {
      layersRef.current.orthophoto.setOpacity(opacity);
    }
  }, [opacity]);

  // Handle Layer Visibility Toggles
  const toggleLayer = (layerName: string) => {
    const newState = { ...activeLayers, [layerName]: !(activeLayers as any)[layerName] };
    setActiveLayers(newState as any);
    const map = mapInstanceRef.current;
    if (!map) return;

    if (layerName === "liveTraffic") {
      setLiveTrafficActive(newState.liveTraffic);
      if (trafficLayerRef.current) {
        if (newState.liveTraffic) map.addLayer(trafficLayerRef.current);
        else map.removeLayer(trafficLayerRef.current);
      }
    } else if (layerName === "orthophoto" && layersRef.current.orthophoto) {
      if (newState.orthophoto) map.addLayer(layersRef.current.orthophoto);
      else map.removeLayer(layersRef.current.orthophoto);
    } else if (layersRef.current[layerName]) {
      if ((newState as any)[layerName]) map.addLayer(layersRef.current[layerName]);
      else map.removeLayer(layersRef.current[layerName]);
    }
  };

  const toggleLandUseCategory = (code: string) => {
    setLandUseFilters((prev) => ({
      ...prev,
      [code]: !prev[code],
    }));
  };

  return (
    <div className="relative w-full h-[700px] rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shadow-2xl">
      {/* Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Left: Layer & Filter Control Panel */}
      <div className="absolute top-4 left-4 z-10 bg-slate-900/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-750 shadow-2xl text-xs space-y-3 max-w-xs max-h-[90%] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between font-bold text-slate-200 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>GIS Digital Twin & Free Maps</span>
          </div>
          <span className="text-[10px] text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800 font-mono">
            WebODM + AI
          </span>
        </div>

        {/* 1. Free Basemap Switcher */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Satellite className="w-3.5 h-3.5 text-cyan-400" />
              <span>บริการแผนที่ดาวเทียมฟรี:</span>
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1 font-mono text-[10px]">
            <button
              onClick={() => switchBasemap("google_hybrid")}
              className={`px-2 py-1.5 rounded text-left transition border ${
                selectedBasemap === "google_hybrid"
                  ? "bg-cyan-950/80 text-cyan-300 border-cyan-600 font-bold shadow"
                  : "bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200"
              }`}
            >
              🛰️ Google Hybrid
            </button>
            <button
              onClick={() => switchBasemap("google_satellite")}
              className={`px-2 py-1.5 rounded text-left transition border ${
                selectedBasemap === "google_satellite"
                  ? "bg-cyan-950/80 text-cyan-300 border-cyan-600 font-bold shadow"
                  : "bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200"
              }`}
            >
              🌍 Google Sat HD
            </button>
            <button
              onClick={() => switchBasemap("esri_satellite")}
              className={`px-2 py-1.5 rounded text-left transition border ${
                selectedBasemap === "esri_satellite"
                  ? "bg-cyan-950/80 text-cyan-300 border-cyan-600 font-bold shadow"
                  : "bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200"
              }`}
            >
              🗺️ Esri Imagery
            </button>
            <button
              onClick={() => switchBasemap("carto_dark")}
              className={`px-2 py-1.5 rounded text-left transition border ${
                selectedBasemap === "carto_dark"
                  ? "bg-cyan-950/80 text-cyan-300 border-cyan-600 font-bold shadow"
                  : "bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200"
              }`}
            >
              🌃 Carto Dark
            </button>
          </div>
        </div>

        {/* 2. Real-Time Traffic Stream Switch (Free Google Traffic) */}
        <div className="pt-2 border-t border-slate-800 space-y-1.5">
          <button
            onClick={() => toggleLayer("liveTraffic")}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border transition ${
              activeLayers.liveTraffic
                ? "bg-emerald-950/90 border-emerald-600 text-emerald-300 shadow-md shadow-emerald-950/50"
                : "bg-slate-800/70 border-slate-700 text-slate-400"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                {activeLayers.liveTraffic && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    activeLayers.liveTraffic ? "bg-emerald-500" : "bg-slate-500"
                  }`}
                ></span>
              </span>
              <span className="font-semibold text-[11px]">🚦 Real-Time Traffic สด</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-mono text-slate-400">{lastTrafficUpdate}</span>
              {activeLayers.liveTraffic ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </div>
          </button>
        </div>

        {/* 3. WebODM Data Layers */}
        <div className="pt-2 border-t border-slate-800 space-y-1.5">
          <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>เลเยอร์สำรวจ WebODM:</span>
          </div>

          <button
            onClick={() => toggleLayer("orthophoto")}
            className={`w-full flex items-center justify-between px-2 py-1 rounded transition ${
              activeLayers.orthophoto ? "bg-teal-900/40 text-teal-300" : "bg-slate-800/60 text-slate-400"
            }`}
          >
            <span>📸 ภาพถ่ายโดรน Orthophoto (ODX)</span>
            {activeLayers.orthophoto ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => toggleLayer("landUse")}
            className={`w-full flex items-center justify-between px-2 py-1 rounded transition ${
              activeLayers.landUse ? "bg-amber-900/40 text-amber-300" : "bg-slate-800/60 text-slate-400"
            }`}
          >
            <span>🏘️ การใช้ประโยชน์ที่ดิน Land Use ({landUse?.features?.length || 5} แปลง)</span>
            {activeLayers.landUse ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>

          {/* Land Use Sub-Categories Filters */}
          {activeLayers.landUse && (
            <div className="pl-3 py-1 space-y-1 text-[10px] border-l-2 border-amber-600/50 my-1 bg-slate-800/30 rounded-r">
              <label className="flex items-center gap-1.5 cursor-pointer text-amber-300">
                <input
                  type="checkbox"
                  checked={landUseFilters.u}
                  onChange={() => toggleLandUseCategory("u")}
                  className="rounded text-amber-500 bg-slate-900 border-slate-700"
                />
                <span>🏢 (u) ย่านเมือง / อาคาร</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-lime-300">
                <input
                  type="checkbox"
                  checked={landUseFilters.a}
                  onChange={() => toggleLandUseCategory("a")}
                  className="rounded text-lime-500 bg-slate-900 border-slate-700"
                />
                <span>🌾 (a) เกษตรกรรม</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-emerald-300">
                <input
                  type="checkbox"
                  checked={landUseFilters.f}
                  onChange={() => toggleLandUseCategory("f")}
                  className="rounded text-emerald-500 bg-slate-900 border-slate-700"
                />
                <span>🌲 (f) ป่าไม้ / อนุรักษ์</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-cyan-300">
                <input
                  type="checkbox"
                  checked={landUseFilters.w}
                  onChange={() => toggleLandUseCategory("w")}
                  className="rounded text-cyan-500 bg-slate-900 border-slate-700"
                />
                <span>💧 (w) แหล่งน้ำ</span>
              </label>
            </div>
          )}

          <button
            onClick={() => toggleLayer("runwayBuffer")}
            className={`w-full flex items-center justify-between px-2 py-1 rounded transition ${
              activeLayers.runwayBuffer ? "bg-red-950/70 text-red-300 border border-red-800/60" : "bg-slate-800/60 text-slate-400"
            }`}
          >
            <span>🛡️ เขตความปลอดภัยทางวิ่ง (Runway Buffer)</span>
            {activeLayers.runwayBuffer ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => toggleLayer("runwaySketch")}
            className={`w-full flex items-center justify-between px-2 py-1 rounded transition ${
              activeLayers.runwaySketch ? "bg-sky-900/40 text-sky-300" : "bg-slate-800/60 text-slate-400"
            }`}
          >
            <span>✈️ แนวแกนทางวิ่ง Runway 03/21</span>
            {activeLayers.runwaySketch ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* 4. GeoAI & Infrastructure Layers */}
        <div className="pt-2 border-t border-slate-800 space-y-1.5">
          <button
            onClick={() => toggleLayer("detections")}
            className={`w-full flex items-center justify-between px-2 py-1 rounded transition ${
              activeLayers.detections ? "bg-blue-900/40 text-blue-300" : "bg-slate-800/60 text-slate-400"
            }`}
          >
            <span>🚗 ตรวจจับวัตถุ GeoAI / YOLO ({detections?.features?.length || 30})</span>
            {activeLayers.detections ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => toggleLayer("parking")}
            className={`w-full flex items-center justify-between px-2 py-1 rounded transition ${
              activeLayers.parking ? "bg-yellow-900/40 text-yellow-300" : "bg-slate-800/60 text-slate-400"
            }`}
          >
            <span>🅿️ ลานจอดและพื้นที่บริการ ({parking?.features?.length || 3} โซน)</span>
            {activeLayers.parking ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => toggleLayer("gcps")}
            className={`w-full flex items-center justify-between px-2 py-1 rounded transition ${
              activeLayers.gcps ? "bg-red-900/40 text-red-300" : "bg-slate-800/60 text-slate-400"
            }`}
          >
            <span>🎯 จุดควบคุมภาคพื้นดิน GCPs ({gcps?.features?.length || 5} จุด)</span>
            {activeLayers.gcps ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Opacity Slider */}
        <div className="pt-2 border-t border-slate-800">
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span>ความโปร่งใสภาพโดรน:</span>
            <span className="font-mono text-emerald-400">{Math.round(opacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={opacity}
            onChange={(e) => setOpacity(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>
      </div>

      {/* Bottom Map Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700 text-[11px] flex flex-wrap items-center gap-4 text-slate-300 shadow-xl max-w-2xl">
        <span className="font-semibold text-slate-400">สัญลักษณ์แผนที่:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          <span>ยานพาหนะ</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
          <span>อากาศยาน</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-2 rounded bg-amber-500/50 border border-amber-500"></span>
          <span>(u) Urban</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-2 rounded bg-lime-500/50 border border-lime-500"></span>
          <span>(a) เกษตร</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-2 rounded bg-emerald-500/50 border border-emerald-500"></span>
          <span>(f) ป่าไม้</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-2 rounded bg-red-500/30 border border-red-500 border-dashed"></span>
          <span>เขต Runway Buffer</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white/50"></span>
          <span>GCP (1.3cm)</span>
        </div>
      </div>

      {/* Selected Feature Inspector Drawer */}
      {selectedFeature && (
        <div className="absolute top-4 right-4 z-10 bg-slate-900/95 backdrop-blur-md p-4 rounded-xl border border-slate-700 shadow-2xl text-xs w-80 space-y-3 animate-in fade-in slide-in-from-right-4 duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-100">
              <Info className="w-4 h-4 text-emerald-400" />
              <span>
                {selectedFeature.type === "detection"
                  ? "รายละเอียดวัตถุ GeoAI"
                  : selectedFeature.type === "land_use"
                  ? "ข้อมูลการใช้ที่ดิน (WebODM)"
                  : selectedFeature.type === "runway_buffer"
                  ? "เขตความปลอดภัยทางวิ่ง"
                  : selectedFeature.type === "parking"
                  ? "ข้อมูลพื้นที่จอดรถ"
                  : selectedFeature.type === "road"
                  ? "ข้อมูลโครงข่ายเส้นทาง"
                  : "จุดควบคุมภาคพื้นดิน GCP"}
              </span>
            </div>
            <button
              onClick={() => setSelectedFeature(null)}
              className="text-slate-400 hover:text-white text-base font-bold"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1.5 text-slate-300">
            {/* Detection Inspector */}
            {selectedFeature.type === "detection" && (
              <>
                <div className="flex justify-between py-0.5 border-b border-slate-800/50">
                  <span className="text-slate-400">Object ID:</span>
                  <span className="font-mono text-emerald-400 font-bold">{selectedFeature.data.object_id}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-800/50">
                  <span className="text-slate-400">ประเภท (Class):</span>
                  <span className="font-semibold text-blue-400 uppercase">{selectedFeature.data.class}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-800/50">
                  <span className="text-slate-400">ความเชื่อมั่น (Conf):</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {(selectedFeature.data.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                {selectedFeature.data.model_source && (
                  <div className="flex justify-between py-0.5 border-b border-slate-800/50">
                    <span className="text-slate-400">โมเดล AI:</span>
                    <span className="font-mono text-purple-300">{selectedFeature.data.model_source}</span>
                  </div>
                )}
                {selectedFeature.data.land_use_name && (
                  <div className="flex justify-between py-0.5 border-b border-slate-800/50">
                    <span className="text-slate-400">โซนที่ดิน (Zoning):</span>
                    <span className="text-yellow-400">{selectedFeature.data.land_use_name}</span>
                  </div>
                )}
                {selectedFeature.data.risk_alert === "RUNWAY_BUFFER_INTRUSION_WARNING" && (
                  <div className="p-2 rounded bg-red-950/80 border border-red-800 text-red-300 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                    <span>แจ้งเตือน: วัตถุอยู่ในเขตปลอดภัยทางวิ่ง (Runway Buffer)</span>
                  </div>
                )}
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">พิกัด WGS84:</span>
                  <span className="font-mono text-[10px]">
                    {selectedFeature.data.wgs84_coords?.[0]}, {selectedFeature.data.wgs84_coords?.[1]}
                  </span>
                </div>
              </>
            )}

            {/* Land Use Inspector */}
            {selectedFeature.type === "land_use" && (
              <>
                <div className="font-semibold text-slate-100 mb-1">{selectedFeature.data.name || "Land Parcel"}</div>
                <div className="flex justify-between py-0.5 border-b border-slate-800/50">
                  <span className="text-slate-400">ประเภทหลักระดับ 1:</span>
                  <span className="font-bold text-amber-400">
                    ({selectedFeature.data.category_code}) {selectedFeature.data.category_name_th}
                  </span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-800/50">
                  <span className="text-slate-400">พื้นที่ (ตารางเมตร):</span>
                  <span className="font-mono text-slate-100 font-bold">
                    {Number(selectedFeature.data.area_sq_m || selectedFeature.data.area).toLocaleString()} ตร.ม.
                  </span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-800/50">
                  <span className="text-slate-400">เทียบเท่าหน่วยไร่:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {selectedFeature.data.area_rai || (selectedFeature.data.area / 1600).toFixed(2)} ไร่
                  </span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">แหล่งข้อมูล:</span>
                  <span className="text-slate-300">WebODM Photogrammetry Layer</span>
                </div>
              </>
            )}

            {/* Runway Buffer Inspector */}
            {selectedFeature.type === "runway_buffer" && (
              <>
                <div className="font-bold text-red-400 mb-1">{selectedFeature.data.name || "Runway Safety Buffer Zone"}</div>
                <div className="flex justify-between py-0.5 border-b border-slate-800/50">
                  <span className="text-slate-400">ความยาวเขตทางวิ่ง:</span>
                  <span className="font-mono text-slate-100">{selectedFeature.data.length} เมตร</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-800/50">
                  <span className="text-slate-400">พื้นที่กันชนรวม:</span>
                  <span className="font-mono text-amber-400">{Number(selectedFeature.data.area).toLocaleString()} ตร.ม.</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-800/50">
                  <span className="text-slate-400">ระดับความปลอดภัย:</span>
                  <span className="text-red-400 font-bold">{selectedFeature.data.risk_level || "CRITICAL RESTRICTED"}</span>
                </div>
                {selectedFeature.data.cost && (
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-400">มูลค่าเขตโครงสร้าง:</span>
                    <span className="font-mono text-emerald-400">{Number(selectedFeature.data.cost).toLocaleString()} บาท</span>
                  </div>
                )}
              </>
            )}

            {/* Parking Inspector */}
            {selectedFeature.type === "parking" && (
              <>
                <div className="font-semibold text-slate-100 mb-1">{selectedFeature.data.name}</div>
                <div className="flex justify-between py-0.5 border-b border-slate-800/50">
                  <span className="text-slate-400">ความจุทั้งหมด:</span>
                  <span className="font-mono text-slate-100">{selectedFeature.data.total_capacity} ช่อง</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-800/50">
                  <span className="text-slate-400">จอดอยู่ปัจจุบัน:</span>
                  <span className="font-mono text-amber-400">{selectedFeature.data.occupied_spots} คัน</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-800/50">
                  <span className="text-slate-400">ว่าง (Available):</span>
                  <span className="font-mono text-emerald-400">{selectedFeature.data.available_spots} ช่อง</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">อัตราการใช้งาน:</span>
                  <span className="font-mono font-bold text-yellow-400">
                    {selectedFeature.data.occupancy_rate_pct}%
                  </span>
                </div>
              </>
            )}

            {/* GCP Inspector */}
            {selectedFeature.type === "gcp" && (
              <>
                <div className="flex justify-between py-0.5 border-b border-slate-800/50">
                  <span className="text-slate-400">GCP Marker ID:</span>
                  <span className="font-bold text-red-400">{selectedFeature.data.id}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-800/50">
                  <span className="text-slate-400">Error X / Y / Z:</span>
                  <span className="font-mono text-[10px]">
                    {selectedFeature.data.error_x_m}m / {selectedFeature.data.error_y_m}m / {selectedFeature.data.error_z_m}m
                  </span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-800/50">
                  <span className="text-slate-400">Total 3D Error:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {selectedFeature.data.total_3d_error_mm} mm (1.3 cm)
                  </span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">สถานะการตรวจสอบ:</span>
                  <span className="text-emerald-400 font-semibold">{selectedFeature.data.status}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

