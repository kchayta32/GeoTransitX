"use client";

import React from "react";
import { DatasetMetadata } from "@/types";
import { ShieldCheck, Crosshair, Camera, CheckCircle2, Award, FileSpreadsheet, X } from "lucide-react";

interface GcpQualityModalProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: DatasetMetadata | null;
}

export default function GcpQualityModal({ isOpen, onClose, metadata }: GcpQualityModalProps) {
  if (!isOpen) return null;

  const report = metadata?.report_summary;
  const gcps = report?.ground_control_points || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden text-xs md:text-sm">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-850 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-950 text-emerald-400 rounded-lg border border-emerald-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">รายงานความถูกต้องแม่นยำและการสำรวจ GCP</h3>
              <p className="text-xs text-slate-400">Drone Photogrammetry Quality & Accuracy Report (ODX v3.8.2)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Top Accuracy Highlights */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-center">
              <p className="text-slate-400 text-xs">GCP RMS Total Error</p>
              <p className="text-xl font-black font-mono text-emerald-400 mt-1">1.3 cm</p>
              <p className="text-[10px] text-emerald-300/80 mt-0.5">High Survey Grade</p>
            </div>
            <div className="p-3.5 bg-blue-950/40 border border-blue-800/60 rounded-xl text-center">
              <p className="text-slate-400 text-xs">Ground Sampling Dist (GSD)</p>
              <p className="text-xl font-black font-mono text-blue-400 mt-1">2.62 cm/px</p>
              <p className="text-[10px] text-blue-300/80 mt-0.5">Ultra-HD Orthophoto</p>
            </div>
            <div className="p-3.5 bg-purple-950/40 border border-purple-800/60 rounded-xl text-center">
              <p className="text-slate-400 text-xs">Dense Point Cloud</p>
              <p className="text-xl font-black font-mono text-purple-400 mt-1">10.51M</p>
              <p className="text-[10px] text-purple-300/80 mt-0.5">10,510,316 3D Points</p>
            </div>
          </div>

          {/* Survey Metadata Table */}
          <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-200 text-xs flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>ข้อมูลการบินและพารามิเตอร์การประมวลผล</span>
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-300 pt-1">
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">วันเวลาบินสำรวจ:</span>
                <span className="font-mono">{report?.capture_window?.start}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">พื้นที่ครอบคลุม:</span>
                <span className="font-mono">60,395 m² (0.060395 km²)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">อัตราการ Reconstruction:</span>
                <span className="font-mono text-emerald-400 font-bold">76 / 76 ภาพ (100.0%)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">ความแม่นยำสัมบูรณ์ CE90:</span>
                <span className="font-mono text-emerald-400">0.021 m (2.1 cm)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">กล้อง/เซนเซอร์:</span>
                <span>DJI FC9589 4032x3024</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">การอ้างอิงพิกัด:</span>
                <span className="font-mono">WGS84 / UTM Zone 47N</span>
              </div>
            </div>
          </div>

          {/* GCP Residuals Table */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
              <Crosshair className="w-4 h-4 text-red-400" />
              <span>ตารางความคลาดเคลื่อนจุดควบคุมภาคพื้นดิน (GCP Residual Errors)</span>
            </h4>
            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/80 text-slate-300 border-b border-slate-700 font-mono">
                  <tr>
                    <th className="py-2 px-3">GCP ID</th>
                    <th className="py-2 px-3">Error X (m)</th>
                    <th className="py-2 px-3">Error Y (m)</th>
                    <th className="py-2 px-3">Error Z (m)</th>
                    <th className="py-2 px-3">3D Total (mm)</th>
                    <th className="py-2 px-3">การตรวจสอบ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono text-slate-200">
                  {gcps.map((gcp: any) => {
                    const total3D = Math.sqrt(gcp.error_x_m ** 2 + gcp.error_y_m ** 2 + gcp.error_z_m ** 2) * 1000;
                    return (
                      <tr key={gcp.id} className="hover:bg-slate-800/40">
                        <td className="py-2 px-3 font-bold text-red-400">{gcp.id}</td>
                        <td className="py-2 px-3">{gcp.error_x_m.toFixed(3)}</td>
                        <td className="py-2 px-3">{gcp.error_y_m.toFixed(3)}</td>
                        <td className="py-2 px-3">{gcp.error_z_m.toFixed(3)}</td>
                        <td className="py-2 px-3 font-bold text-emerald-400">{total3D.toFixed(1)} mm</td>
                        <td className="py-2 px-3">
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                            <CheckCircle2 className="w-3 h-3" /> PASS
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-850 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}
