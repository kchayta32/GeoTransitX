"use client";

import React, { useEffect, useRef, useState } from "react";
import { DatasetMetadata } from "@/types";
import { Layers, Eye, EyeOff, MapPin, Car, Plane, Navigation, ShieldCheck, Info } from "lucide-react";

interface MapViewProps {
  metadata: DatasetMetadata | null;
  detections: any | null;
  network: any | null;
  parking: any | null;
  gcps: any | null;
}

export default function MapView({
  metadata,
  detections,
  network,
  parking,
  gcps,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layersRef = useRef<{ [key: string]: any }>({});

  const [opacity, setOpacity] = useState<number>(0.9);
  const [activeLayers, setActiveLayers] = useState({
    orthophoto: true,
    detections: true,
    network: true,
    parking: true,
    gcps: true,
  });

  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [filterClass, setFilterClass] = useState<string>("all");

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    // Dynamically import Leaflet to avoid SSR window error
    import("leaflet").then((L) => {
      // Fix default marker icon issues in Webpack/Next.js
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
          minZoom: 14,
          maxZoom: 21,
          attributionControl: false,
        });

        // Satellite & Dark Basemaps
        const satelliteLayer = L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          { maxZoom: 20 }
        );
        const darkLayer = L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
          { maxZoom: 20 }
        );

        darkLayer.addTo(map);

        // Bounds for Orthophoto overlay
        const bounds = metadata?.georeferencing?.bounds_wgs84 || [
          [13.230275, 100.953076],
          [13.234600, 100.957303],
        ];

        // 1. Orthophoto Overlay
        const orthophotoOverlay = L.imageOverlay("/data/orthophoto_web.png", bounds, {
          opacity: opacity,
          interactive: false,
        }).addTo(map);
        layersRef.current.orthophoto = orthophotoOverlay;

        // 2. Parking Zones Layer
        const parkingLayerGroup = L.layerGroup().addTo(map);
        layersRef.current.parking = parkingLayerGroup;
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
            parkingLayerGroup.addLayer(poly);
          });
        }

        // 3. Road Network Layer
        const networkLayerGroup = L.layerGroup().addTo(map);
        layersRef.current.network = networkLayerGroup;
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
            networkLayerGroup.addLayer(line);
          });
        }

        // 4. GCP Layer
        const gcpLayerGroup = L.layerGroup().addTo(map);
        layersRef.current.gcps = gcpLayerGroup;
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
            gcpLayerGroup.addLayer(marker);
          });
        }

        // 5. GeoAI Detections Layer
        const detectionLayerGroup = L.layerGroup().addTo(map);
        layersRef.current.detections = detectionLayerGroup;
        if (detections?.features) {
          detections.features.forEach((feat: any) => {
            const [lon, lat] = feat.geometry.coordinates;
            const cls = feat.properties.class;
            let iconColor = "#3b82f6";
            let radius = 6;
            if (cls === "airplane") {
              iconColor = "#a855f7";
              radius = 9;
            } else if (cls === "truck") {
              iconColor = "#f97316";
              radius = 7;
            } else if (cls === "person") {
              iconColor = "#10b981";
              radius = 4;
            }

            const marker = L.circleMarker([lat, lon], {
              radius: radius,
              fillColor: iconColor,
              color: "#ffffff",
              weight: 1.5,
              opacity: 1,
              fillOpacity: 0.85,
            });

            // Bounding box polygon
            if (feat.properties.bbox_polygon) {
              const poly = L.polygon(
                feat.properties.bbox_polygon.map((c: number[]) => [c[1], c[0]]),
                {
                  color: iconColor,
                  weight: 1.5,
                  fillOpacity: 0.15,
                }
              );
              detectionLayerGroup.addLayer(poly);
            }

            marker.on("click", () => setSelectedFeature({ type: "detection", data: feat.properties }));
            marker.bindTooltip(
              `<b>${feat.properties.object_id}</b> (${cls})<br/>ความเชื่อมั่น: ${(feat.properties.confidence * 100).toFixed(1)}%`,
              { sticky: true }
            );
            detectionLayerGroup.addLayer(marker);
          });
        }

        mapInstanceRef.current = map;
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [metadata, detections, network, parking, gcps]);

  // Handle Opacity Slider Changes
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

    if (layerName === "orthophoto" && layersRef.current.orthophoto) {
      if (newState.orthophoto) map.addLayer(layersRef.current.orthophoto);
      else map.removeLayer(layersRef.current.orthophoto);
    } else if (layersRef.current[layerName]) {
      if ((newState as any)[layerName]) map.addLayer(layersRef.current[layerName]);
      else map.removeLayer(layersRef.current[layerName]);
    }
  };

  return (
    <div className="relative w-full h-[650px] rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shadow-2xl">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md p-3 rounded-lg border border-slate-700 shadow-lg text-xs space-y-2 max-w-xs">
        <div className="flex items-center justify-between font-semibold text-slate-200 border-b border-slate-750 pb-1.5">
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>ชั้นข้อมูล GIS & Digital Twin</span>
          </div>
          <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800">
            Live Orthophoto
          </span>
        </div>

        {/* Layer Toggles */}
        <div className="space-y-1.5 pt-1">
          <button
            onClick={() => toggleLayer("orthophoto")}
            className={`w-full flex items-center justify-between px-2 py-1 rounded transition ${
              activeLayers.orthophoto ? "bg-emerald-900/40 text-emerald-300" : "bg-slate-800/60 text-slate-400"
            }`}
          >
            <span>📸 ภาพถ่ายโดรน Orthophoto (ODX)</span>
            {activeLayers.orthophoto ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => toggleLayer("detections")}
            className={`w-full flex items-center justify-between px-2 py-1 rounded transition ${
              activeLayers.detections ? "bg-blue-900/40 text-blue-300" : "bg-slate-800/60 text-slate-400"
            }`}
          >
            <span>🚗 ตรวจจับวัตถุ GeoAI ({detections?.features?.length || 30} รายการ)</span>
            {activeLayers.detections ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => toggleLayer("parking")}
            className={`w-full flex items-center justify-between px-2 py-1 rounded transition ${
              activeLayers.parking ? "bg-amber-900/40 text-amber-300" : "bg-slate-800/60 text-slate-400"
            }`}
          >
            <span>🅿️ ลานจอดและพื้นที่บริการ ({parking?.features?.length || 3} โซน)</span>
            {activeLayers.parking ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => toggleLayer("network")}
            className={`w-full flex items-center justify-between px-2 py-1 rounded transition ${
              activeLayers.network ? "bg-indigo-900/40 text-indigo-300" : "bg-slate-800/60 text-slate-400"
            }`}
          >
            <span>🛣️ โครงข่ายถนน/ทางวิ่ง ({network?.features?.length || 5} สาย)</span>
            {activeLayers.network ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
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
            <span>ความโปร่งใสภาพ Orthophoto:</span>
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
      <div className="absolute bottom-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700 text-[11px] flex items-center gap-4 text-slate-300 shadow-md">
        <span className="font-semibold text-slate-400">สัญลักษณ์:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          <span>รถยนต์ (Car)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
          <span>อากาศยาน (Aircraft)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
          <span>รถบรรทุก (Truck)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white/50"></span>
          <span>จุด GCP</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-1 bg-pink-500"></span>
          <span>Runway 03/21</span>
        </div>
      </div>

      {/* Selected Feature Inspector Drawer */}
      {selectedFeature && (
        <div className="absolute top-4 right-4 z-10 bg-slate-900/95 backdrop-blur-md p-4 rounded-xl border border-slate-700 shadow-2xl text-xs w-72 space-y-3 animate-in fade-in slide-in-from-right-4 duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-100">
              <Info className="w-4 h-4 text-emerald-400" />
              <span>
                {selectedFeature.type === "detection"
                  ? "รายละเอียดวัตถุ GeoAI"
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
            {selectedFeature.type === "detection" && (
              <>
                <div className="flex justify-between py-0.5 border-b border-slate-800/50">
                  <span className="text-slate-400">Object ID:</span>
                  <span className="font-mono text-emerald-400">{selectedFeature.data.object_id}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-800/50">
                  <span className="text-slate-400">ประเภท (Class):</span>
                  <span className="font-semibold text-blue-400 uppercase">{selectedFeature.data.class}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-800/50">
                  <span className="text-slate-400">ความเชื่อมั่น (Conf):</span>
                  <span className="font-mono text-amber-400">
                    {(selectedFeature.data.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-800/50">
                  <span className="text-slate-400">พิกัด WGS84:</span>
                  <span className="font-mono text-[10px]">
                    {selectedFeature.data.wgs84_coords?.[0]}, {selectedFeature.data.wgs84_coords?.[1]}
                  </span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">สถานะ:</span>
                  <span className="text-slate-200">{selectedFeature.data.status}</span>
                </div>
              </>
            )}

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
                <div className="flex justify-between py-0.5 border-b border-slate-800/50">
                  <span className="text-slate-400">อัตราการใช้งาน:</span>
                  <span className="font-mono font-bold text-yellow-400">
                    {selectedFeature.data.occupancy_rate_pct}%
                  </span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">ผิวจราจร:</span>
                  <span>{selectedFeature.data.surface_type}</span>
                </div>
              </>
            )}

            {selectedFeature.type === "road" && (
              <>
                <div className="font-semibold text-slate-100 mb-1">{selectedFeature.data.name}</div>
                <div className="flex justify-between py-0.5 border-b border-slate-800/50">
                  <span className="text-slate-400">ประเภท:</span>
                  <span className="text-indigo-300">{selectedFeature.data.road_type}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-800/50">
                  <span className="text-slate-400">จำนวนช่องจราจร:</span>
                  <span>{selectedFeature.data.lanes} เลน</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-800/50">
                  <span className="text-slate-400">ความเร็วจำกัด:</span>
                  <span className="font-mono text-emerald-400">{selectedFeature.data.speed_limit_kmh} กม./ชม.</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">ขีดความสามารถรองรับ:</span>
                  <span className="font-mono text-amber-400">{selectedFeature.data.capacity_vph} คัน/ชม.</span>
                </div>
              </>
            )}

            {selectedFeature.type === "gcp" && (
              <>
                <div className="flex justify-between py-0.5 border-b border-slate-800/50">
                  <span className="text-slate-400">GCP Marker ID:</span>
                  <span className="font-bold text-red-400">{selectedFeature.data.id}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-800/50">
                  <span className="text-slate-400">Error X (m):</span>
                  <span className="font-mono">{selectedFeature.data.error_x_m} m</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-800/50">
                  <span className="text-slate-400">Error Y (m):</span>
                  <span className="font-mono">{selectedFeature.data.error_y_m} m</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-800/50">
                  <span className="text-slate-400">Error Z (m):</span>
                  <span className="font-mono">{selectedFeature.data.error_z_m} m</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-800/50">
                  <span className="text-slate-400">Total 3D Error:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {selectedFeature.data.total_3d_error_mm} mm
                  </span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">การประเมิน:</span>
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
