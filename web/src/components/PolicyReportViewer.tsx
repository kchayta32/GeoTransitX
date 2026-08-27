"use client";

import React, { useState } from "react";
import { PolicyReportData } from "@/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FileText, Printer, Copy, Check, Sparkles, RefreshCw, Download, ShieldCheck, MapPin } from "lucide-react";

interface PolicyReportViewerProps {
  reportData: PolicyReportData | null;
  onRefresh?: () => void;
}

export default function PolicyReportViewer({ reportData, onRefresh }: PolicyReportViewerProps) {
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCopy = () => {
    if (!reportData?.markdown_content) return;
    navigator.clipboard.writeText(reportData.markdown_content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Report Header & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-xl shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-950/80 border border-emerald-800 text-emerald-400 rounded-md">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-slate-100 text-base">
              {reportData?.title || "รายงานเชิงนโยบายและการบริหารจัดการการจราจรอัจฉริยะ"}
            </h3>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>{reportData?.location || "สนามบินบางพระ (Bang Phra Airport), จ.ชลบุรี (EEC Zone)"}</span>
            <span>•</span>
            <span className="font-mono text-emerald-400">{reportData?.generated_by}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "คัดลอกแล้ว!" : "คัดลอก Markdown"}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg shadow transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>พิมพ์ / บันทึก PDF</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg text-xs">
          <p className="text-slate-400">ความแม่นยำสำรวจโดรน</p>
          <p className="font-bold font-mono text-emerald-400 text-sm mt-0.5">
            {reportData?.summary_kpis?.drone_survey_accuracy_cm || "1.3"} cm (CE90: 2.1cm)
          </p>
        </div>
        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg text-xs">
          <p className="text-slate-400">จุดคอขวดวิกฤตสูงสุด</p>
          <p className="font-bold font-mono text-red-400 text-sm mt-0.5">
            {reportData?.summary_kpis?.peak_hour || "17:30"} น. ({reportData?.summary_kpis?.peak_volume_vph || "940"} vph)
          </p>
        </div>
        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg text-xs">
          <p className="text-slate-400">ระดับการให้บริการเฉลี่ย</p>
          <p className="font-bold font-mono text-amber-400 text-sm mt-0.5">
            {reportData?.summary_kpis?.peak_los || "LOS D/E (Moderate/Heavy)"}
          </p>
        </div>
        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg text-xs">
          <p className="text-slate-400">การปล่อยคาร์บอนต่อวัน</p>
          <p className="font-bold font-mono text-rose-400 text-sm mt-0.5">
            {reportData?.summary_kpis?.co2_emissions_kg?.toLocaleString() || "1,420.5"} kg-CO2
          </p>
        </div>
      </div>

      {/* Markdown Body Content Card */}
      <div className="bg-slate-900/90 border border-slate-800 p-8 rounded-xl shadow-2xl text-slate-200">
        <article className="prose prose-invert prose-emerald max-w-none space-y-4 leading-relaxed text-sm md:text-base">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {reportData?.markdown_content || "กำลังโหลดรายงาน..."}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  );
}
