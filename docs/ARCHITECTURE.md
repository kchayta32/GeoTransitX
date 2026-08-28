# 🏗️ GeoTransitX: System Architecture & Folder Structure

## 📁 โครงสร้างไดเรกทอรีที่เป็นระเบียบ (Project Folder Hierarchy)

`
GeoTransitX/
├── data/                         # ศูนย์รวมชุดข้อมูลนำเข้าและประมวลผล (Data Assets)
│   ├── raw/                      # ข้อมูลดิบภาพถ่ายโดรนและรายงานสำรวจ GCP
│   │   ├── Bang-Phra-Airport-8-26-2026-orthophoto.tif  # ภาพถ่ายความละเอียด 2.62 cm/px (142MB)
│   │   ├── Bang-Phra-Airport-8-26-2026-report.pdf      # รายงานวิเคราะห์ความคลาดเคลื่อน GCP
│   │   └── orthophoto_thumb.png                        # ภาพตัวอย่าง Thumbnail
│   └── webodm/                   # ข้อมูลสำรวจจาก WebODM Photogrammetry
│       ├── Buffer_Runway.geojson                       # เขตความปลอดภัยทางวิ่ง (145,056 m²)
│       ├── land_use.geojson                            # การใช้ประโยชน์ที่ดิน 5 หมวดหมู่ (u, a, f, w, m)
│       ├── Sketches_Runway.geojson                     # แกนทางวิ่ง Runway 03/21
│       └── Sketches_Lotus.geojson                      # ตำแหน่งจุดสำรวจภาคสนาม
│
├── models/                       # ศูนย์รวมโมเดล AI / Deep Learning Weights
│   └── yolov8n.pt                # โมเดล YOLO Object Detection & Segmentation
│
├── python_pipeline/              # Backend Multi-Agent AI System
│   ├── config.py                 # Central Configuration & Path Resolver
│   ├── orchestrator.py           # Primary Agent Multi-Agent Orchestrator
│   ├── data_agent.py             # Data Agent (WebODM & Drone Ingestion)
│   ├── ai_agent.py               # AI Agent (YOLO Seg & 24h Diurnal Simulation)
│   ├── llm_agent.py              # LLM Agent (OpenTyphoon Thai Policy Synthesis)
│   ├── server.py                 # FastAPI REST Backend Server
│   └── verify_endpoints.py       # Automated Verification & Quality Audit
│
├── web/                          # Frontend Dashboard (Next.js 14 + React)
│   ├── public/                   # Static assets & Public GeoJSON datasets
│   │   ├── data/                 # Auto-generated pipeline outputs
│   │   └── index.html            # Standalone Interactive Dashboard
│   ├── src/                      # Next.js Source Code
│   │   ├── app/                  # App Router & Main Dashboard Page
│   │   ├── components/           # UI Components (MapView, SimulationCanvas, etc.)
│   │   ├── lib/                  # Firebase SDK & Client Utilities
│   │   └── types/                # TypeScript Interfaces & GIS Types
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── workshops/                    # สื่อการเรียนรู้และ Workshop Notebooks
│   ├── 1_workshop1_landcover.ipynb  # การจำแนกสิ่งปกคลุมดิน
│   ├── 2_workshop2_chm_trees.ipynb  # แบบจำลองความสูงต้นไม้ (CHM)
│   ├── 3_workshop3_flood.ipynb      # แบบจำลองน้ำท่วม
│   └── 4_workshop4_traffic_cv.ipynb # การตรวจจับจราจรด้วย Computer Vision
│
├── docs/                         # คู่มือและเอกสารสถาปัตยกรรม
│   └── ARCHITECTURE.md           # สถาปัตยกรรมและรายละเอียดโฟลเดอร์
│
├── run.py                        # Unified CLI Command Center
└── README.md                     # คู่มือการใช้งานภาพรวม
`
