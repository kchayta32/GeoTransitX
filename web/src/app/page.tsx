"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  DatasetMetadata,
  SimulationData,
  PolicyReportData,
  OrchestratorStatus,
} from "@/types";
import {
  Layers,
  Activity,
  BarChart3,
  FileText,
  Bot,
  ShieldCheck,
  MapPin,
  Sparkles,
  Zap,
  Globe,
  Radio,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

import AnalyticsPanel from "@/components/AnalyticsPanel";
import PolicyReportViewer from "@/components/PolicyReportViewer";
import TyphoonChat from "@/components/TyphoonChat";
import GcpQualityModal from "@/components/GcpQualityModal";

// Dynamically import client-only components
const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });
const SimulationCanvas = dynamic(() => import("@/components/SimulationCanvas"), { ssr: false });

export default function GeoTransitXDashboard() {
  const [activeTab, setActiveTab] = useState<"map" | "simulation" | "analytics" | "report" | "chat">("map");
  const [isGcpModalOpen, setIsGcpModalOpen] = useState<boolean>(false);

  const [metadata, setMetadata] = useState<DatasetMetadata | null>(null);
  const [detections, setDetections] = useState<any | null>(null);
  const [network, setNetwork] = useState<any | null>(null);
  const [parking, setParking] = useState<any | null>(null);
  const [gcps, setGcps] = useState<any | null>(null);
  const [simulationData, setSimulationData] = useState<SimulationData | null>(null);
  const [policyReport, setPolicyReport] = useState<PolicyReportData | null>(null);
  const [orchestratorStatus, setOrchestratorStatus] = useState<OrchestratorStatus | null>(null);

  // Load all pre-processed pipeline data from public/data
  useEffect(() => {
    async function loadData() {
      try {
        const [metaRes, detRes, netRes, pkgRes, gcpRes, simRes, repRes, orchRes] = await Promise.all([
          fetch("/data/dataset_metadata.json").then((r) => r.json()),
          fetch("/data/detections.geojson").then((r) => r.json()),
          fetch("/data/network.geojson").then((r) => r.json()),
          fetch("/data/parking.geojson").then((r) => r.json()),
          fetch("/data/gcps.geojson").then((r) => r.json()),
          fetch("/data/traffic_simulation.json").then((r) => r.json()),
          fetch("/data/policy_report.json").then((r) => r.json()),
          fetch("/data/orchestrator_status.json").then((r) => (r.ok ? r.json() : null)),
        ]);

        setMetadata(metaRes);
        setDetections(detRes);
        setNetwork(netRes);
        setParking(pkgRes);
        setGcps(gcpRes);
        setSimulationData(simRes);
        setPolicyReport(repRes);
        setOrchestratorStatus(orchRes);
      } catch (err) {
        console.error("Error loading GeoTransitX data files:", err);
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
      {/* 1. Global Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#0c1222]/95 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 text-white shadow-lg shadow-emerald-950/50">
              <Globe className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-wider text-slate-100">
                  GEOTRANSIT<span className="text-emerald-400">X</span>
                </h1>
                <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-mono font-bold">
                  v1.0 AI Engine
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Predictive Traffic & Transit Management System</p>
            </div>
          </div>

          {/* Sub-Agent Live Status Indicators */}
          <div className="hidden md:flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-mono">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-slate-400">Agents:</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-800/60">
              DataAgent: OK
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-950/70 text-blue-300 border border-blue-800/60">
              AIAgent: OK
            </span>
            <span className="px-2 py-0.5 rounded bg-purple-950/70 text-purple-300 border border-purple-800/60">
              Typhoon LLM: 30B
            </span>
            <span className="px-2 py-0.5 rounded bg-teal-950/70 text-teal-300 border border-teal-800/60">
              VizAgent: OK
            </span>
          </div>

          {/* Action Header Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsGcpModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition shadow"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>GCP Accuracy (1.3cm)</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Project Context & Survey Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800/60 px-4 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between text-xs text-slate-300 gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold text-slate-100">
              สนามบินบางพระ (Bang Phra Airport), จ.ชลบุรี • ระเบียงเศรษฐกิจพิเศษภาคตะวันออก (EEC)
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>
              พื้นที่: <strong className="text-slate-200">60,395 m²</strong>
            </span>
            <span>•</span>
            <span>
              GSD: <strong className="text-emerald-400">2.62 cm/px</strong>
            </span>
            <span>•</span>
            <span>
              พิกัด: <strong className="text-slate-200">UTM Zone 47N</strong>
            </span>
            <span>•</span>
            <span>
              GCP RMS: <strong className="text-emerald-400">0.013 m</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 3. Main Navigation Tab Buttons */}
      <div className="bg-[#0c1222]/80 border-b border-slate-800 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto no-scrollbar py-2">
          <button
            onClick={() => setActiveTab("map")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition shrink-0 ${
              activeTab === "map"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/40"
                : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>🗺️ GIS & Digital Twin (แผนที่เชิงพื้นที่)</span>
          </button>

          <button
            onClick={() => setActiveTab("simulation")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition shrink-0 ${
              activeTab === "simulation"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/40"
                : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>🚦 แบบจำลองการจราจร 24 ชม. (Simulation)</span>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition shrink-0 ${
              activeTab === "analytics"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/40"
                : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>📊 สถิติ & Smart Parking (Analytics)</span>
          </button>

          <button
            onClick={() => setActiveTab("report")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition shrink-0 ${
              activeTab === "report"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/40"
                : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>📑 รายงานเชิงนโยบาย (Policy Report)</span>
          </button>

          <button
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition shrink-0 ${
              activeTab === "chat"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/40"
                : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>🤖 Typhoon AI Advisor (สนทนา AI)</span>
          </button>
        </div>
      </div>

      {/* 4. Tab Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8">
        {activeTab === "map" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-100">
                  แผนที่ภาพถ่ายทางอากาศความละเอียดสูงและผลการตรวจจับ GeoAI
                </h2>
                <p className="text-xs text-slate-400">
                  ผสาน Orthophoto Drone Imagery (GSD 2.62cm) กับโครงข่ายถนน ลานจอด และจุดควบคุม GCP
                </p>
              </div>
            </div>
            <MapView
              metadata={metadata}
              detections={detections}
              network={network}
              parking={parking}
              gcps={gcps}
            />
          </div>
        )}

        {activeTab === "simulation" && (
          <SimulationCanvas simulationData={simulationData} />
        )}

        {activeTab === "analytics" && (
          <AnalyticsPanel
            simulationData={simulationData}
            metadata={metadata}
            parkingData={parking}
          />
        )}

        {activeTab === "report" && (
          <PolicyReportViewer reportData={policyReport} />
        )}

        {activeTab === "chat" && (
          <TyphoonChat initialContext={{ metadata, simulationData, policyReport }} />
        )}
      </main>

      {/* 5. Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 px-4 lg:px-8 py-5 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-0.5">
            <p className="font-semibold text-slate-400">GeoTransitX • Smart City & Predictive Transit Platform</p>
            <p className="text-[11px]">
              GCP Project ID: <code className="text-slate-300 font-mono">geoai-506806</code> | Project No:{" "}
              <code className="text-slate-300 font-mono">334457340669</code>
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Orchestration: Antigravity Multi-Agent</span>
            <span>•</span>
            <span>LLM: OpenTyphoon (typhoon-v2.5-30b-a3b)</span>
            <span>•</span>
            <span>Frontend: Next.js + React</span>
          </div>
        </div>
      </footer>

      {/* Accuracy & GCP Diagnostics Modal */}
      <GcpQualityModal
        isOpen={isGcpModalOpen}
        onClose={() => setIsGcpModalOpen(false)}
        metadata={metadata}
      />
    </div>
  );
}
