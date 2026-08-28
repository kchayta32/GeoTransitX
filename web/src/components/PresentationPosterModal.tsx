"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Download,
  Eye,
  CheckCircle2,
  TrendingUp,
  Presentation,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";

interface PresentationPosterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PresentationPosterModal({ isOpen, onClose }: PresentationPosterModalProps) {
  const [modalTab, setModalTab] = useState<"slides" | "banners">("slides");
  const [selectedSlide, setSelectedSlide] = useState<number>(0);
  const [selectedPoster, setSelectedPoster] = useState<number>(0);

  if (!isOpen) return null;

  const slides = [
    {
      id: "slide-1",
      slideNo: "Slide 1",
      title: "Title & Executive Cover Slide",
      subtitle: "สไลด์เปิดหัวเรื่อง GeoTransitX พร้อมตราสัญลักษณ์ BOI-STEAM, สอวช, DDM, BUU",
      filename: "/slides/slide-1-cover.jpg",
      badge: "📌 Cover",
      highlights: [
        "โครงการกลุ่ม : ขนส่ง (Transportation Group) ณ วันที่ 28 สิงหาคม 2569",
        "GeoAI + Drone Photogrammetry + OpenTyphoon LLM",
        "Digital Twin สำหรับเมืองอัจฉริยะและสนามบิน EEC",
        "ความร่วมมือ BOI-STEAM, สอวช, Dev Drone Mapper, มหาวิทยาลัยบูรพา",
      ],
    },
    {
      id: "slide-2",
      slideNo: "Slide 2",
      title: "Problem & Solution Comparison",
      subtitle: "เปรียบเทียบข้อจำกัดการสำรวจการจราจรแบบดั้งเดิม vs นวัตกรรม GeoTransitX",
      filename: "/slides/slide-2-problem.jpg",
      badge: "⚠️ Pain Points",
      highlights: [
        "วิธีเดิม: สำรวจช้า 2-4 สัปดาห์ ค่าใช้จ่ายสูงหลักแสนหลักล้าน",
        "วิธีเดิม: ข้อมูล 2D ไม่มีระดับมิลลิเมตร และแก้ปัญหาแบบตั้งรับหลังรถติด",
        "GeoTransitX: โดรนสำรวจเร็วใน 1 วัน ลดต้นทุน 70%",
        "GeoTransitX: 3D Digital Twin 1.3 cm + แบบจำลองคาดการณ์ 24 ชม. ลดติด 35%",
      ],
    },
    {
      id: "slide-3",
      slideNo: "Slide 3",
      title: "Multi-Agent AI Architecture & Tech Stack",
      subtitle: "โครงสร้างสถาปัตยกรรม 4 ผู้ช่วย AI อัจฉริยะ ทำงานประสานกันแบบอัตโนมัติ",
      filename: "/slides/slide-3-architecture.jpg",
      badge: "🤖 Architecture",
      highlights: [
        "DataAgent: Ingestion ภาพถ่ายโดรน, WebODM 3D Orthophoto, GCP 1.3cm",
        "AIAgent: YOLOv8 GeoAI Multi-Object Detection & 24H Traffic Flow Simulation",
        "LLMAgent: OpenTyphoon 30B LLM สังเคราะห์ Auto Executive Policy Report",
        "VizAgent: Interactive Leaflet 3D GIS & Digital Twin Web Dashboard",
      ],
    },
    {
      id: "slide-4",
      slideNo: "Slide 4",
      title: "Business Model Canvas (BMC)",
      subtitle: "สไลด์ Business Model Canvas 9 ช่อง ครบถ้วนตามมาตรฐาน BOI / สอวช / DDM / BUU",
      filename: "/slides/slide-4-bmc.jpg",
      badge: "⭐ BMC Canvas",
      highlights: [
        "Key Partners: Dev Drone Mapper (DDM), ม.บูรพา (BUU), สอวช., BOI, EEC",
        "Value Propositions: Digital Twin 1.3cm, 24h Predictive AI, Thai Executive Report",
        "Customer Segments: กรมท่าอากาศยาน, AOT, สำนักงาน EEC, เทศบาลเมือง, นิคมฯ",
        "Revenue Streams: Software SaaS รายปี, ค่าประมวลผลต่อเที่ยวบิน, Smart City TOC Integration",
      ],
    },
    {
      id: "slide-5",
      slideNo: "Slide 5",
      title: "Pilot Case Study : สนามบินบางพระ จ.ชลบุรี (EEC)",
      subtitle: "ผลการทดสอบจริงภาคสนามและตัวชี้วัดความแม่นยำสูงพิเศษ",
      filename: "/slides/slide-5-pilot.jpg",
      badge: "✈️ Pilot Case",
      highlights: [
        "พื้นที่สำรวจโดรน 60,395 ตร.ม., GSD 2.62 ซม./px, Point Cloud 10.51 ล้านจุด",
        "ความแม่นยำ 3D GCP RMS 1.3 ซม. (CE90 2.1 ซม., LE90 1.2 ซม.)",
        "ปริมาณจราจร 4,820 คัน/วัน คาดการณ์คอขวด 08:15 และ 17:30 น. (LOS D/E)",
        "ESG Green Mobility: ลดการปล่อยคาร์บอน (CO2) 22% ด้วย Feeder EV Shuttle",
      ],
    },
    {
      id: "slide-6",
      slideNo: "Slide 6",
      title: "Market Opportunity & 3-Year Scaling Roadmap",
      subtitle: "โอกาสทางการตลาดและการขยายผลเชิงพาณิชย์ 3 ระยะสู่ระดับประเทศและอาเซียน",
      filename: "/slides/slide-6-roadmap.jpg",
      badge: "📈 Roadmap",
      highlights: [
        "Phase 1 (2569): Pilot สนามบินบางพระ & ระเบียงเศรษฐกิจพิเศษ EEC",
        "Phase 2 (2570): ขยายสู่สนามบินพาณิชย์ AOT & นิคมอุตสาหกรรมใน EEC",
        "Phase 3 (2571): แพลตฟอร์ม Smart City Digital Twin ทั่วประเทศ & ASEAN",
        "Business Model: SaaS Cloud Platform + On-Demand Drone Processing ROI สูง",
      ],
    },
  ];

  const posters = [
    {
      id: "pitch",
      title: "Commercial Pitch & Value Proposition Poster",
      subtitle: "โปสเตอร์นำเสนอคุณค่าเชิงพาณิชย์และจุดเด่นหลัก 4 ด้าน (Investment & Executive Pitch)",
      filename: "/banners/banner-pitch.jpg",
      badge: "⭐ Featured Pitch",
      highlights: [
        "1.3cm 3D Drone Photogrammetry Precision",
        "24H Predictive Traffic Simulation (LOS A-F)",
        "OpenTyphoon 30B LLM Executive Policy Synthesis",
        "ESG Carbon Reduction -22% & Green Mobility",
      ],
    },
    {
      id: "hero",
      title: "Future Smart City & Digital Twin Banner",
      subtitle: "แบนเนอร์ภาพรวมเทคโนโลยี GeoAI ล้ำสมัยและระบบโครงข่ายจราจรอัจฉริยะ (Visionary Hero Banner)",
      filename: "/banners/banner-hero.jpg",
      badge: "🚀 Hero Banner",
      highlights: [
        "Holographic 3D Digital Twin City & Airport Tarmac",
        "Autonomous Drone LiDAR Laser Scan Grid",
        "Real-Time YOLOv8 Vehicle & Aircraft Detection",
        "Multi-Agent AI Pipeline Orchestration",
      ],
    },
    {
      id: "enterprise",
      title: "Enterprise Operations & Command Center Banner",
      subtitle: "แบนเนอร์ศูนย์บัญชาการควบคุมการจราจรเมืองอัจฉริยะ EEC (Smart City TOC / Operations Room)",
      filename: "/banners/banner-enterprise.jpg",
      badge: "🏢 Enterprise Hub",
      highlights: [
        "Interactive 3D Digital Twin Command Table",
        "Real-Time GIS Heatmaps & Flow Dynamics",
        "Proactive 24H Chokepoint Alerts",
        "Thai LLM Policy Insights for Decision Makers",
      ],
    },
    {
      id: "value",
      title: "Investor Pitch & Platform Overview Poster",
      subtitle: "โปสเตอร์สรุปสเปกและคุณประโยชน์ของแพลตฟอร์มระดับสากล (Product Showcase & Specs)",
      filename: "/banners/banner-value.jpg",
      badge: "💡 Product Specs",
      highlights: [
        "End-to-End Drone to Executive Dashboard Pipeline",
        "Stochastic Micro-simulation of Traffic Volume & Delay",
        "Multi-Modal Airport & Feeder Route Integration",
        "100% Policy-Ready for Public & Private Sectors",
      ],
    },
  ];

  const currentItem = modalTab === "slides" ? slides[selectedSlide] : posters[selectedPoster];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[94vh] flex flex-col overflow-hidden text-xs md:text-sm">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-850 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 text-white rounded-xl shadow-lg shadow-emerald-950/50">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-100 text-base md:text-lg">
                  GeoTransitX Presentation Deck & Marketing Banners (16:9)
                </h3>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-mono">
                  BOI-STEAM • สอวช • DDM • BUU
                </span>
              </div>
              <p className="text-xs text-slate-400">
                ชุดสไลด์นำเสนอ 6 สไลด์ (รวม BMC) และแบนเนอร์การตลาดความละเอียดสูง 16:9
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Mode Selector Tabs */}
        <div className="flex items-center gap-3 px-6 py-2.5 bg-slate-950 border-b border-slate-800 shrink-0">
          <button
            onClick={() => setModalTab("slides")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition text-xs ${
              modalTab === "slides"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-950"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
            }`}
          >
            <Presentation className="w-4 h-4" />
            <span>📊 สไลด์นำเสนอ 6 สไลด์ (รวม BMC สอวช/BOI)</span>
          </button>

          <button
            onClick={() => setModalTab("banners")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition text-xs ${
              modalTab === "banners"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-950"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>🖼️ โปสเตอร์ & แบนเนอร์การตลาด 4 แบบ</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Thumbnails Navigation */}
          {modalTab === "slides" ? (
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSlide(idx)}
                  className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                    selectedSlide === idx
                      ? "bg-emerald-950/70 border-emerald-500 text-white shadow-lg shadow-emerald-950/40"
                      : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 block">
                      {s.badge}
                    </span>
                    <p className="font-bold text-[11px] truncate text-slate-200 mt-0.5">{s.slideNo}</p>
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 truncate">{s.title}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {posters.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPoster(idx)}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                    selectedPoster === idx
                      ? "bg-emerald-950/70 border-emerald-500 text-white shadow-lg shadow-emerald-950/40"
                      : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 block mb-1">
                      {p.badge}
                    </span>
                    <p className="font-bold text-xs truncate text-slate-200">{p.title}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-2 font-mono">16:9 Widescreen</span>
                </button>
              ))}
            </div>
          )}

          {/* Current Frame Preview (16:9) */}
          <div className="space-y-3">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-2xl group">
              <img
                src={currentItem.filename}
                alt={currentItem.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
              />
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <a
                  href={currentItem.filename}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs rounded-lg border border-slate-700 backdrop-blur-md transition shadow"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>ดูภาพเต็ม</span>
                </a>
                <a
                  href={currentItem.filename}
                  download={`geotransitx-${currentItem.id}-16x9.jpg`}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-emerald-950 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลด 16:9</span>
                </a>
              </div>
            </div>

            {/* Slide / Banner Details & Key Takeaways */}
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">{currentItem.title}</h4>
                  <p className="text-xs text-slate-400">{currentItem.subtitle}</p>
                </div>
                <span className="text-xs bg-slate-700/60 text-emerald-300 font-mono px-2.5 py-1 rounded-md border border-slate-600">
                  Aspect Ratio: 16:9 (Presentation Ready)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                {currentItem.highlights.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-xs bg-slate-900/60 border border-slate-800 px-3 py-2 rounded-lg text-slate-300"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick BMC Highlights Box */}
          <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-800/40 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <TrendingUp className="w-5 h-5" />
              <span>สรุปภาพรวม Business Model Canvas (กลุ่ม : ขนส่ง / Transportation)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              GeoTransitX มุ่งเน้นการสร้างรายได้แบบ <strong>SaaS Subscription</strong> และ <strong>Pay-per-Flight Processing</strong> สำหรับหน่วยงานกำกับดูแลการบิน (DOA, AOT) และเมืองอัจฉริยะ EEC โดยมีต้นทุนหลักอยู่ที่ Cloud GPU และทีมวิศวกร AI/GIS พร้อมความร่วมมือด้านงานวิจัยและสิทธิประโยชน์กับ <strong>BOI-STEAM, สอวช., Dev Drone Mapper (DDM) และ มหาวิทยาลัยบูรพา (BUU)</strong>
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-850 border-t border-slate-800 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-slate-400 font-mono">
            GeoTransitX Presentation Deck (6 Slides + BMC) • Ready for BOI-STEAM Pitching
          </p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}
