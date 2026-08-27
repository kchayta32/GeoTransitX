"use client";

import React, { useState, useEffect, useRef } from "react";
import { SimulationData, SimulationTimelineStep } from "@/types";
import { Play, Pause, FastForward, RotateCcw, AlertTriangle, Activity, Gauge, Flame, Car, Clock } from "lucide-react";

interface SimulationCanvasProps {
  simulationData: SimulationData | null;
  onTimeChange?: (step: SimulationTimelineStep) => void;
}

export default function SimulationCanvas({ simulationData, onTimeChange }: SimulationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(10); // Default around 08:30
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1x, 2x, 5x

  const timeline = simulationData?.timeline || [];
  const currentStep = timeline[currentStepIndex] || timeline[0];

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

  // Render Canvas Vehicles and Network
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentStep) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = "#0b1329";
    ctx.fillRect(0, 0, width, height);

    // Draw Background Grid
    ctx.strokeStyle = "rgba(30, 41, 59, 0.4)";
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Coordinate Normalizer (Lat: 13.2302 - 13.2346, Lon: 100.9530 - 100.9573)
    const minLat = 13.2302;
    const maxLat = 13.2346;
    const minLon = 100.9530;
    const maxLon = 100.9573;

    const toCanvasX = (lon: number) => ((lon - minLon) / (maxLon - minLon)) * (width - 120) + 60;
    const toCanvasY = (lat: number) => height - (((lat - minLat) / (maxLat - minLat)) * (height - 120) + 60);

    // 1. Draw Runway 03/21
    const rwStart = [toCanvasX(100.9535), toCanvasY(13.2303)];
    const rwEnd = [toCanvasX(100.9568), toCanvasY(13.2345)];

    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 26;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(rwStart[0], rwStart[1]);
    ctx.lineTo(rwEnd[0], rwEnd[1]);
    ctx.stroke();

    // Runway Centerline Dash
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 2;
    ctx.setLineDash([12, 10]);
    ctx.beginPath();
    ctx.moveTo(rwStart[0], rwStart[1]);
    ctx.lineTo(rwEnd[0], rwEnd[1]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. Draw Arterial Road & Terminal Loop
    const roadPoints = [
      [toCanvasX(100.9532), toCanvasY(13.2305)],
      [toCanvasX(100.9541), toCanvasY(13.2316)],
      [toCanvasX(100.9548), toCanvasY(13.2323)],
      [toCanvasX(100.9555), toCanvasY(13.2329)],
    ];

    // Road Shadow & Pavement
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 16;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(roadPoints[0][0], roadPoints[0][1]);
    for (let i = 1; i < roadPoints.length; i++) {
      ctx.lineTo(roadPoints[i][0], roadPoints[i][1]);
    }
    ctx.stroke();

    // Congestion Glow on Arterial Road
    const speed = currentStep.speed_kmh;
    const roadColor =
      speed > 35 ? "rgba(16, 185, 129, 0.6)" : speed > 22 ? "rgba(245, 158, 11, 0.7)" : "rgba(239, 68, 68, 0.85)";
    ctx.strokeStyle = roadColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(roadPoints[0][0], roadPoints[0][1]);
    for (let i = 1; i < roadPoints.length; i++) {
      ctx.lineTo(roadPoints[i][0], roadPoints[i][1]);
    }
    ctx.stroke();

    // 3. Draw Parking Zone Box
    const pkgX = toCanvasX(100.9543);
    const pkgY = toCanvasY(13.2320);
    ctx.fillStyle = "rgba(30, 58, 138, 0.35)";
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2;
    ctx.fillRect(pkgX - 45, pkgY - 30, 90, 60);
    ctx.strokeRect(pkgX - 45, pkgY - 30, 90, 60);

    ctx.fillStyle = "#93c5fd";
    ctx.font = "11px Inter, sans-serif";
    ctx.fillText("Terminal Parking", pkgX - 40, pkgY - 14);
    ctx.fillStyle = currentStep.parking_occupancy_pct > 80 ? "#f87171" : "#34d399";
    ctx.font = "bold 12px Inter, sans-serif";
    ctx.fillText(`Occupancy: ${currentStep.parking_occupancy_pct}%`, pkgX - 40, pkgY + 4);

    // 4. Draw Moving Vehicle Agents
    const agents = currentStep.active_agents || [];
    agents.forEach((agent, i) => {
      const cx = toCanvasX(agent.lon);
      const cy = toCanvasY(agent.lat);

      if (agent.type === "airplane") {
        // Airplane icon
        ctx.fillStyle = "#c084fc";
        ctx.shadowColor = "#a855f7";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(cx, cy, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = "#ffffff";
        ctx.font = "9px Inter, sans-serif";
        ctx.fillText("✈️ AC", cx - 8, cy - 10);
      } else {
        // Vehicle icon
        const vColor =
          speed > 35 ? "#10b981" : speed > 22 ? "#fbbf24" : "#ef4444";
        ctx.fillStyle = vColor;
        ctx.shadowColor = vColor;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(cx, cy, agent.type === "bus" ? 6 : 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });

    // 5. Draw Bottleneck Warning Pin if heavy congestion
    if (currentStep.los === "E" || currentStep.los === "F") {
      const bX = toCanvasX(100.9548);
      const bY = toCanvasY(13.2323);
      ctx.fillStyle = "rgba(239, 68, 68, 0.25)";
      ctx.beginPath();
      ctx.arc(bX, bY, 35, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ef4444";
      ctx.font = "bold 11px Inter, sans-serif";
      ctx.fillText("⚠️ BOTTLENECK CHOKEPOINT", bX - 70, bY - 25);
    }
  }, [currentStep]);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-800/80 text-emerald-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <span>แบบจำลองการจราจรและการเคลื่อนที่เชิงคาดการณ์ 24 ชั่วโมง</span>
              <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded-full font-mono">
                Stochastic Agent Flow
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              เวลาจำลอง: <span className="text-emerald-400 font-bold font-mono text-sm">{currentStep?.time} น.</span> |
              ระดับการให้บริการ (LOS):{" "}
              <span className="font-bold font-mono px-1.5 py-0.2 rounded" style={{ color: currentStep?.los_color }}>
                LOS {currentStep?.los} ({currentStep?.status_th})
              </span>
            </p>
          </div>
        </div>

        {/* Jump to Critical Hours Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">จุดวิกฤต:</span>
          <button
            onClick={() => {
              const idx = timeline.findIndex((t) => t.time === "08:15");
              if (idx !== -1) setCurrentStepIndex(idx);
            }}
            className="px-2.5 py-1 text-xs bg-amber-950/60 hover:bg-amber-900 border border-amber-800/80 text-amber-300 rounded-md transition font-mono"
          >
            ☀️ เช้า 08:15 (860 vph)
          </button>
          <button
            onClick={() => {
              const idx = timeline.findIndex((t) => t.time === "12:00");
              if (idx !== -1) setCurrentStepIndex(idx);
            }}
            className="px-2.5 py-1 text-xs bg-blue-950/60 hover:bg-blue-900 border border-blue-800/80 text-blue-300 rounded-md transition font-mono"
          >
            ✈️ ฝึกบิน 12:00 (500 vph)
          </button>
          <button
            onClick={() => {
              const idx = timeline.findIndex((t) => t.time === "17:30");
              if (idx !== -1) setCurrentStepIndex(idx);
            }}
            className="px-2.5 py-1 text-xs bg-red-950/70 hover:bg-red-900 border border-red-800/80 text-red-300 rounded-md transition font-mono animate-pulse"
          >
            🚨 เย็น 17:30 (940 vph Peak)
          </button>
        </div>
      </div>

      {/* Main Canvas Simulation Window */}
      <div className="relative w-full h-[520px] rounded-xl overflow-hidden border border-slate-800 bg-[#0b1329] shadow-2xl">
        <canvas ref={canvasRef} width={900} height={520} className="w-full h-full object-cover" />

        {/* Overlay Current State Gauges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
          <div className="bg-slate-900/90 backdrop-blur-md p-3 rounded-lg border border-slate-700 shadow-xl w-60 text-xs space-y-2">
            <div className="flex justify-between items-center text-slate-300 border-b border-slate-800 pb-1.5">
              <span className="font-semibold flex items-center gap-1">
                <Car className="w-3.5 h-3.5 text-blue-400" />
                ปริมาณจราจร
              </span>
              <span className="font-bold font-mono text-sm text-blue-400">{currentStep?.volume_vph} vph</span>
            </div>

            <div className="flex justify-between items-center text-slate-300 border-b border-slate-800 pb-1.5">
              <span className="font-semibold flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                ความเร็วเฉลี่ย
              </span>
              <span className="font-bold font-mono text-sm text-emerald-400">{currentStep?.speed_kmh} กม./ชม.</span>
            </div>

            <div className="flex justify-between items-center text-slate-300 border-b border-slate-800 pb-1.5">
              <span className="font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                ความล่าช้า (Delay)
              </span>
              <span className="font-bold font-mono text-sm text-amber-400">{currentStep?.delay_seconds} วินาที</span>
            </div>

            <div className="flex justify-between items-center text-slate-300">
              <span className="font-semibold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-red-400" />
                การปล่อย CO2
              </span>
              <span className="font-bold font-mono text-sm text-red-400">{currentStep?.co2_emissions_kgh} kg/h</span>
            </div>
          </div>
        </div>

        {/* Bottleneck Alert Box if Peak */}
        {(currentStep?.los === "E" || currentStep?.los === "F") && (
          <div className="absolute top-4 right-4 bg-red-950/90 backdrop-blur-md border border-red-700 p-3 rounded-lg text-xs text-red-200 max-w-xs shadow-2xl flex items-start gap-2.5 animate-bounce">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-red-100">แจ้งเตือนภาวะติดขัดวิกฤต (Bottleneck Alert)</div>
              <p className="text-[11px] text-red-300 mt-0.5">
                บริเวณวงเวียนทางแยกเชื่อมต่อทางหลวงสุขุมวิท ปริมาณรถเกิน 85% ของความจุถนน แนะนำเปิดสัญญาณระบายรถพิเศษ
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Playback Control Bar & Scrubber */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-lg space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-1.5 shadow"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? "พักการจำลอง (Pause)" : "เริ่มเล่นจำลอง (Play)"}</span>
            </button>

            <button
              onClick={() => setCurrentStepIndex(0)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="เริ่มใหม่ตั้งแต่ 06:00"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Speed Multipliers */}
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 ml-2 border border-slate-700">
              {[1, 2, 5, 10].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2 py-1 rounded text-xs font-mono transition ${
                    playbackSpeed === spd ? "bg-emerald-600 text-white font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          <div className="font-mono text-sm">
            ความคืบหน้า: <span className="text-emerald-400 font-bold">{currentStep?.time}</span> / 22:00 น.
          </div>
        </div>

        {/* Timeline Range Scrubber */}
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
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>06:00 (เช้าตรู่)</span>
            <span className="text-amber-400 font-bold">08:15 (Peak เช้า)</span>
            <span>12:00 (เที่ยง)</span>
            <span className="text-red-400 font-bold">17:30 (Peak เย็น)</span>
            <span>22:00 (กลางคืน)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
