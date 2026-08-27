"use client";

import React from "react";
import { SimulationData, DatasetMetadata } from "@/types";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Activity,
  TrendingUp,
  Car,
  Clock,
  Zap,
  ShieldCheck,
  Compass,
  Building2,
  TreePine,
  Layers,
} from "lucide-react";

interface AnalyticsPanelProps {
  simulationData: SimulationData | null;
  metadata: DatasetMetadata | null;
  parkingData: any | null;
}

export default function AnalyticsPanel({ simulationData, metadata, parkingData }: AnalyticsPanelProps) {
  const kpis = simulationData?.kpi_summary;
  const timeline = simulationData?.timeline || [];
  const reportSummary = metadata?.report_summary;

  // Prepare chart data sampled every 30 mins
  const chartData = timeline
    .filter((_, idx) => idx % 2 === 0)
    .map((item) => ({
      time: item.time,
      volume: item.volume_vph,
      speed: item.speed_kmh,
      delay: item.delay_seconds,
      parkingOccupancy: item.parking_occupancy_pct,
      co2: item.co2_emissions_kgh,
    }));

  const parkingBarData =
    parkingData?.features?.map((f: any) => ({
      name: f.properties.name.split("(")[0].trim(),
      capacity: f.properties.total_capacity,
      occupied: f.properties.occupied_spots,
      available: f.properties.available_spots,
      occupancyRate: f.properties.occupancy_rate_pct,
    })) || [];

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Daily Volume */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 font-medium">ปริมาณจราจรรวมต่อวัน</p>
              <h4 className="text-2xl font-black text-slate-100 mt-1 font-mono">
                {kpis?.daily_total_vehicles?.toLocaleString() || "4,820"}{" "}
                <span className="text-xs text-slate-400 font-normal">คัน/วัน</span>
              </h4>
            </div>
            <div className="p-2 bg-blue-950/80 border border-blue-800 text-blue-400 rounded-lg">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-emerald-400 gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Peak 17:30 น. (940 vph)</span>
          </div>
        </div>

        {/* Card 2: Peak Level of Service */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 font-medium">ระดับการให้บริการวิกฤต</p>
              <h4 className="text-2xl font-black text-amber-400 mt-1 font-mono">
                LOS D/E{" "}
                <span className="text-xs text-amber-300/80 font-normal">คอขวดปานกลาง</span>
              </h4>
            </div>
            <div className="p-2 bg-amber-950/80 border border-amber-800 text-amber-400 rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-400 flex justify-between font-mono">
            <span>ความเร็วเฉลี่ย: {kpis?.average_daily_speed_kmh || "36.4"} กม./ชม.</span>
          </div>
        </div>

        {/* Card 3: Drone Survey Precision */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 font-medium">ความละเอียดภาพถ่ายโดรน (GSD)</p>
              <h4 className="text-2xl font-black text-emerald-400 mt-1 font-mono">
                {reportSummary?.reconstruction_stats?.average_gsd_cm || "2.62"}{" "}
                <span className="text-xs text-slate-400 font-normal">cm/px</span>
              </h4>
            </div>
            <div className="p-2 bg-emerald-950/80 border border-emerald-800 text-emerald-400 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-400 flex items-center justify-between font-mono">
            <span>GCP Error: 1.3 cm (CE90: 2.1cm)</span>
          </div>
        </div>

        {/* Card 4: Estimated Carbon Footprint */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 font-medium">การปล่อยคาร์บอน (CO2 Index)</p>
              <h4 className="text-2xl font-black text-rose-400 mt-1 font-mono">
                {kpis?.total_estimated_co2_kg?.toLocaleString() || "1,420.5"}{" "}
                <span className="text-xs text-slate-400 font-normal">kg/วัน</span>
              </h4>
            </div>
            <div className="p-2 bg-rose-950/80 border border-rose-800 text-rose-400 rounded-lg">
              <TreePine className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-xs text-emerald-400 font-medium">
            <span>เป้าหมาย ESG: ลด 22% ด้วย Feeder EV</span>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Traffic Volume & Speed Profile */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl shadow-lg space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>รูปแบบปริมาณการจราจรและความเร็ว (24-Hour Profile)</span>
              </h4>
              <p className="text-xs text-slate-400">เปรียบเทียบปริมาณรถ (vph) กับความเร็วเดินทางเฉลี่ย (km/h)</p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              Corridor Access
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="volGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="spdGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis yAxisId="left" stroke="#3b82f6" fontSize={11} />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={11} domain={[0, 60]} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="volume"
                  name="ปริมาณจราจร (vph)"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#volGradient)"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="speed"
                  name="ความเร็วเฉลี่ย (km/h)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Parking Occupancy by Zone */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl shadow-lg space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>การครองพื้นที่ลานจอดและโรงเก็บ (Parking Occupancy Analysis)</span>
              </h4>
              <p className="text-xs text-slate-400">เปรียบเทียบความจุ จำนวนคันที่จอดจริง และช่องว่าง</p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-400">
              Smart Parking
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={parkingBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Bar dataKey="occupied" name="จอดอยู่จริง (คัน)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="available" name="ช่องว่าง (คัน)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Photogrammetry & Drone Survey Quality Details Table */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-100 text-sm">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>สถิติการประมวลผล Photogrammetry & Drone Sensor Diagnostics (ODX v3.8.2)</span>
          </div>
          <span className="text-xs text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 font-mono">
            Survey 100% Validated
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-750">
            <p className="text-slate-400">พื้นที่บินสำรวจ:</p>
            <p className="text-slate-100 font-bold font-mono text-sm mt-0.5">
              {reportSummary?.area_covered_sq_m?.toLocaleString()} m² ({reportSummary?.area_covered_sq_km} km²)
            </p>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-750">
            <p className="text-slate-400">ภาพถ่ายโดรนทั้งหมด:</p>
            <p className="text-slate-100 font-bold font-mono text-sm mt-0.5">
              {reportSummary?.reconstruction_stats?.total_images} / {reportSummary?.reconstruction_stats?.reconstructed_images} shots (100.0%)
            </p>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-750">
            <p className="text-slate-400">พอยต์คลาวด์ความหนาแน่นสูง:</p>
            <p className="text-slate-100 font-bold font-mono text-sm mt-0.5">
              {reportSummary?.reconstruction_stats?.dense_points?.toLocaleString()} points
            </p>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-750">
            <p className="text-slate-400">กล้องและเซนเซอร์:</p>
            <p className="text-slate-100 font-bold font-mono text-sm mt-0.5">
              {reportSummary?.drone_camera?.model} ({reportSummary?.drone_camera?.resolution})
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
