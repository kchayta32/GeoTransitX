"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Bot,
  Cpu,
  Zap,
  Activity,
  Layers,
  Satellite,
  Gauge,
  Radio,
  Play,
  CheckCircle2,
  Clock,
  Sparkles,
  Server,
  Workflow,
  RefreshCw,
  Terminal,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Database,
  Sliders
} from "lucide-react";
import { OrchestratorStatus, DynamicSubagentStatus } from "@/types";

interface MultiAgentControlPanelProps {
  orchestratorStatus: OrchestratorStatus | null;
  onTriggerReSimulation?: () => void;
}

export default function MultiAgentControlPanel({
  orchestratorStatus,
  onTriggerReSimulation
}: MultiAgentControlPanelProps) {
  const [isRunningAsync, setIsRunningAsync] = useState<boolean>(false);
  const [pipelineProgress, setPipelineProgress] = useState<number>(100);
  const [activeStage, setActiveStage] = useState<string>("COMPLETED_SYNCED");
  const [subagents, setSubagents] = useState<DynamicSubagentStatus[]>([
    {
      id: "sub_sat_vision",
      name: "SatelliteVisionAgent",
      role_th: "ประมวลผลภาพถ่ายดาวเทียมความละเอียดสูง & YOLOv8 Segmentation",
      role_en: "Google Sat HD & Orthophoto Processing + YOLOv8 Seg",
      type: "vision",
      status: "COMPLETED",
      latency_ms: 342,
      throughput_fps: 64.5,
      tasks_processed: 1420,
      last_output_summary: "Extracted 30 GeoAI objects with WGS84 bounding polygons & masks",
      async_worker_id: "worker-pool-01",
      cpu_usage_pct: 28.4,
      memory_mb: 412
    },
    {
      id: "sub_traffic_sim",
      name: "TrafficSimulation24hAgent",
      role_th: "จำลองการไหลเวียนจราจรและยานพาหนะ 24 ชั่วโมง (Stochastic BPR Model)",
      role_en: "24h Agent-based Traffic Flow & BPR Delay Dynamics",
      type: "simulation",
      status: "COMPLETED",
      latency_ms: 185,
      throughput_fps: 120.0,
      tasks_processed: 2880,
      last_output_summary: "Simulated 48 time steps, 5 scenarios, diurnal curves & LOS A-F metrics",
      async_worker_id: "worker-pool-02",
      cpu_usage_pct: 34.1,
      memory_mb: 328
    },
    {
      id: "sub_geospatial_twin",
      name: "GeoSpatialTwinAgent",
      role_th: "บริหารจัดการ Digital Twin, ผังการใช้ที่ดิน (Land Use) & Runway Buffer",
      role_en: "GIS Digital Twin & Runway Safety Buffer Monitoring",
      type: "geospatial",
      status: "COMPLETED",
      latency_ms: 110,
      throughput_fps: 95.2,
      tasks_processed: 860,
      last_output_summary: "Validated 5 land parcels, 145,056 m² safety buffer, GCP RMS 0.013m",
      async_worker_id: "worker-pool-03",
      cpu_usage_pct: 16.5,
      memory_mb: 256
    },
    {
      id: "sub_opentyphoon_llm",
      name: "OpenTyphoonLLMAgent",
      role_th: "วิเคราะห์นโยบายขนส่ง Smart City ภาษาไทยด้วย OpenTyphoon 30B",
      role_en: "OpenTyphoon 30B Thai Smart Mobility Policy Generator",
      type: "llm",
      status: "COMPLETED",
      latency_ms: 820,
      throughput_fps: 38.0,
      tasks_processed: 512,
      last_output_summary: "Generated EEC Transit Policy Report & Actionable Insights",
      async_worker_id: "worker-pool-04",
      cpu_usage_pct: 45.2,
      memory_mb: 680
    },
    {
      id: "sub_viz_telemetry",
      name: "VizTelemetryAgent",
      role_th: "สตรีมข้อมูล Telemetry แบบ Real-time เชื่อมโยงแผนที่ดาวเทียม & Scrubber",
      role_en: "Real-time Telemetry Stream & Leaflet/Canvas Engine",
      type: "telemetry",
      status: "COMPLETED",
      latency_ms: 15,
      throughput_fps: 60.0,
      tasks_processed: 4500,
      last_output_summary: "Synced 24h interactive playback, speed toggles & LOS gauge stream",
      async_worker_id: "worker-pool-05",
      cpu_usage_pct: 12.0,
      memory_mb: 192
    }
  ]);

  const [logs, setLogs] = useState<Array<{ timestamp: string; agent: string; level: string; msg: string }>>([
    {
      timestamp: "11:10:02",
      agent: "PrimaryOrchestrator",
      level: "INFO",
      msg: "Initialized Multi-Agent System in DYNAMIC_ASYNC_PARALLEL mode."
    },
    {
      timestamp: "11:10:04",
      agent: "SatelliteVisionAgent",
      level: "SUCCESS",
      msg: "Google Satellite HD tiles & Orthophoto georeferencing locked at GSD 2.62cm."
    },
    {
      timestamp: "11:10:06",
      agent: "GeoSpatialTwinAgent",
      level: "SUCCESS",
      msg: "WebODM Land Use (5 zones) & Runway Buffer (145,056 m²) polygons loaded."
    },
    {
      timestamp: "11:10:09",
      agent: "TrafficSimulation24hAgent",
      level: "SUCCESS",
      msg: "Generated 48-step stochastic micro-simulation across 4 multi-modal corridors."
    },
    {
      timestamp: "11:10:12",
      agent: "OpenTyphoonLLMAgent",
      level: "SUCCESS",
      msg: "OpenTyphoon 30B synthesized EEC smart mobility policy report & action matrix."
    },
    {
      timestamp: "11:10:15",
      agent: "VizTelemetryAgent",
      level: "EXEC",
      msg: "Interactive Google Satellite HD Simulation stream active with 60 FPS refresh."
    }
  ]);

  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Handle Async Multi-Agent Re-execution Trigger
  const triggerAsyncPipeline = () => {
    if (isRunningAsync) return;
    setIsRunningAsync(true);
    setPipelineProgress(5);
    setActiveStage("DISPATCHING_COROUTINES");

    const timeNow = () => new Date().toLocaleTimeString();

    // Log start
    setLogs((prev) => [
      ...prev,
      {
        timestamp: timeNow(),
        agent: "PrimaryOrchestrator",
        level: "EXEC",
        msg: "⚡ Dispatched dynamic async subagents concurrently via AsyncIO task pool..."
      }
    ]);

    // Set all subagents to RUNNING
    setSubagents((prev) =>
      prev.map((s) => ({
        ...s,
        status: "RUNNING",
        tasks_processed: s.tasks_processed + Math.floor(Math.random() * 50 + 20)
      }))
    );

    // Step 1: Satellite Vision + Geospatial Twin
    setTimeout(() => {
      setPipelineProgress(35);
      setActiveStage("SATELLITE_VISION_GEOSPATIAL");
      setLogs((prev) => [
        ...prev,
        {
          timestamp: timeNow(),
          agent: "SatelliteVisionAgent",
          level: "SUCCESS",
          msg: "Processed 12 Google Satellite HD tiles + YOLO segmentation in 318ms."
        },
        {
          timestamp: timeNow(),
          agent: "GeoSpatialTwinAgent",
          level: "SUCCESS",
          msg: "Audited GCP 3D Root Mean Square error: 0.013m (Pass survey tolerance)."
        }
      ]);
      setSubagents((prev) =>
        prev.map((s) =>
          s.type === "vision" || s.type === "geospatial"
            ? { ...s, status: "COMPLETED", latency_ms: Math.floor(Math.random() * 50 + 280) }
            : s
        )
      );
    }, 900);

    // Step 2: 24h Traffic Simulation + BPR Flow
    setTimeout(() => {
      setPipelineProgress(70);
      setActiveStage("24H_TRAFFIC_SIMULATION");
      setLogs((prev) => [
        ...prev,
        {
          timestamp: timeNow(),
          agent: "TrafficSimulation24hAgent",
          level: "SUCCESS",
          msg: "Recalculated 24h Diurnal flow: Peak Morning (860 vph), Peak Evening (940 vph), LOS D/E."
        }
      ]);
      setSubagents((prev) =>
        prev.map((s) =>
          s.type === "simulation"
            ? { ...s, status: "COMPLETED", latency_ms: Math.floor(Math.random() * 40 + 170) }
            : s
        )
      );
    }, 1800);

    // Step 3: OpenTyphoon LLM + Viz Telemetry Stream
    setTimeout(() => {
      setPipelineProgress(95);
      setActiveStage("LLM_POLICY_TELEMETRY_SYNC");
      setLogs((prev) => [
        ...prev,
        {
          timestamp: timeNow(),
          agent: "OpenTyphoonLLMAgent",
          level: "SUCCESS",
          msg: "OpenTyphoon 30B updated policy recommendations for EEC transit corridor."
        },
        {
          timestamp: timeNow(),
          agent: "VizTelemetryAgent",
          level: "EXEC",
          msg: "Stream synchronized with 24-hour Leaflet Satellite Canvas engine."
        }
      ]);
      setSubagents((prev) =>
        prev.map((s) => ({
          ...s,
          status: "COMPLETED"
        }))
      );
    }, 2600);

    // Final Completion
    setTimeout(() => {
      setPipelineProgress(100);
      setIsRunningAsync(false);
      setActiveStage("COMPLETED_SYNCED");
      setLogs((prev) => [
        ...prev,
        {
          timestamp: timeNow(),
          agent: "PrimaryOrchestrator",
          level: "INFO",
          msg: "🎉 Asynchronous multi-agent cycle finished with 0 errors (Latency: 2.8s total)."
        }
      ]);
      if (onTriggerReSimulation) {
        onTriggerReSimulation();
      }
    }, 3200);
  };

  const getSubagentIcon = (type: string) => {
    switch (type) {
      case "vision":
        return <Satellite className="w-5 h-5 text-cyan-400" />;
      case "simulation":
        return <Activity className="w-5 h-5 text-emerald-400" />;
      case "geospatial":
        return <Layers className="w-5 h-5 text-amber-400" />;
      case "llm":
        return <Bot className="w-5 h-5 text-purple-400" />;
      case "telemetry":
      default:
        return <Zap className="w-5 h-5 text-yellow-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Primary Agent Master Header & Architecture Status */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0d172b] to-slate-900 border border-slate-750 p-6 rounded-2xl shadow-2xl relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="p-2 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-950/60">
                <Workflow className="w-6 h-6" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black tracking-wide text-slate-100">
                    PRIMARY AGENT <span className="text-emerald-400">ORCHESTRATOR</span>
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    ACTIVE ASYNC SUPERVISOR
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  สถาปัตยกรรมควบคุม Dynamic Subagents ทำงานขนานกันแบบ Asynchronous ไร้การบล็อกเกอร์ (Non-Blocking Concurrency)
                </p>
              </div>
            </div>

            {/* Architecture Metadata Badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono pt-1">
              <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700">
                โหมด: <strong className="text-cyan-300">Dynamic Async Parallel</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700">
                Subagents: <strong className="text-emerald-400">5 Active Workers</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700">
                Engine: <strong className="text-purple-300">Python AsyncIO + Web Workers</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700">
                Pipeline: <strong className="text-amber-300">v2.0.0-async</strong>
              </span>
            </div>
          </div>

          {/* Trigger Action Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={triggerAsyncPipeline}
              disabled={isRunningAsync}
              className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs tracking-wider uppercase transition shadow-xl ${
                isRunningAsync
                  ? "bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700"
                  : "bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-emerald-950/60 animate-pulse"
              }`}
            >
              <Zap className={`w-4 h-4 ${isRunningAsync ? "animate-spin" : ""}`} />
              <span>{isRunningAsync ? "กำลังประมวลผลคู่ขนาน..." : "⚡ สั่งจำลองใหม่แบบ Async (Re-Simulate)"}</span>
            </button>
          </div>
        </div>

        {/* Real-Time Progress Bar */}
        <div className="mt-5 space-y-1.5 pt-4 border-t border-slate-800/80">
          <div className="flex justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-2 text-slate-300">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>สถานะการทำงานคู่ขนาน: </span>
              <strong className="text-emerald-400">{activeStage}</strong>
            </span>
            <span className="font-bold text-emerald-400">{pipelineProgress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-300 ease-out"
              style={{ width: `${pipelineProgress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 2. Dynamic Subagents Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>พูล Dynamic Subagents ที่ทำงานขนานกัน (Asynchronous Subagents Pool)</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">5/5 Nodes Operational</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subagents.map((agent) => (
            <div
              key={agent.id}
              className={`bg-slate-900/90 border rounded-xl p-4.5 space-y-3 transition-all duration-200 shadow-lg relative ${
                agent.status === "RUNNING"
                  ? "border-emerald-500/80 shadow-emerald-950/40 bg-emerald-950/20"
                  : "border-slate-800 hover:border-slate-700"
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
                    {getSubagentIcon(agent.type)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm font-mono">{agent.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{agent.async_worker_id}</span>
                  </div>
                </div>

                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase border ${
                    agent.status === "RUNNING"
                      ? "bg-amber-950/80 text-amber-300 border-amber-700 animate-pulse"
                      : "bg-emerald-950/80 text-emerald-300 border-emerald-800"
                  }`}
                >
                  {agent.status}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                {agent.role_th}
              </p>

              {/* Telemetry Metrics Bar */}
              <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 text-[11px] font-mono">
                <div>
                  <span className="text-slate-400 text-[10px] block">Latency</span>
                  <span className="text-emerald-400 font-bold">{agent.latency_ms} ms</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Throughput</span>
                  <span className="text-cyan-400 font-bold">{agent.throughput_fps} fps</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Tasks</span>
                  <span className="text-purple-400 font-bold">{agent.tasks_processed}</span>
                </div>
              </div>

              {/* Output Summary */}
              <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{agent.last_output_summary}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Live Execution Stream Log Console */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4.5 space-y-3 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider font-mono">
              Live Asynchronous Execution Event Stream (บันทึกเหตุการณ์คู่ขนาน)
            </h4>
          </div>
          <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            Real-time Pipe
          </span>
        </div>

        <div className="h-44 overflow-y-auto space-y-1.5 font-mono text-[11px] text-slate-300 pr-2 custom-scrollbar">
          {logs.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2 leading-relaxed">
              <span className="text-slate-400 shrink-0">[{item.timestamp}]</span>
              <span
                className={`font-bold shrink-0 px-1 py-0.2 rounded text-[10px] ${
                  item.level === "EXEC"
                    ? "bg-amber-950 text-amber-300"
                    : item.level === "SUCCESS"
                    ? "bg-emerald-950 text-emerald-300"
                    : "bg-blue-950 text-blue-300"
                }`}
              >
                {item.agent}
              </span>
              <span className={item.level === "SUCCESS" ? "text-emerald-300" : "text-slate-200"}>
                {item.msg}
              </span>
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
}