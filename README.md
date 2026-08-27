# 🛰️ GeoTransitX: Predictive Traffic & Smart Transit Management System
> **GeoAI + Drone Photogrammetry + OpenTyphoon LLM for Smart City Digital Twin & Predictive Transit Intelligence**

[![Python 3.12](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![Typhoon LLM](https://img.shields.io/badge/LLM-OpenTyphoon%2030B-emerald.svg)](https://opentyphoon.ai/)
[![GeoAI](https://img.shields.io/badge/GeoAI-YOLOv8%20%2B%20GIS-orange.svg)](https://ultralytics.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🌍 บทนำและความสำคัญ (Overview)
**GeoTransitX** คือแพลตฟอร์มบริหารจัดการและคาดการณ์การจราจรอัจฉริยะ (Predictive Traffic & Transit Management) สำหรับเมืองอัจฉริยะ (Smart City) และพื้นที่ระเบียงเศรษฐกิจพิเศษภาคตะวันออก (EEC) โดยผสานรวม:
1. **ภาพถ่ายทางอากาศความละเอียดสูงพิเศษ (Drone Orthophoto)**: สำรวจ ณ **สนามบินบางพระ (Bang Phra Airport)** จ.ชลบุรี (ครอบคลุม 60,395 ตร.ม., GSD 2.62 ซม./พิกเซล, Dense Point Cloud 10.51 ล้านจุด, ความแม่นยำ GCP 1.3 ซม.)
2. **GeoAI Feature Extraction**: ตรวจจับยานพาหนะ อากาศยาน โครงข่ายถนน และวิเคราะห์การครองพื้นที่ลานจอดรถ (YOLOv8 + Spatial Tiling)
3. **แบบจำลองการจราจรเชิงคาดการณ์ 24 ชั่วโมง (Predictive Traffic Simulation)**: คำนวณปริมาณรถ (vph), ความเร็วเฉลี่ย, จุดคอขวด (Bottlenecks), ระดับการให้บริการ (LOS A-F), ความล่าช้า และดัชนีคาร์บอน (CO2 Footprint)
4. **OpenTyphoon LLM Intelligence (`typhoon-v2.5-30b-a3b-instruct`)**: สังเคราะห์รายงานเชิงนโยบายระดับผู้บริหาร (Executive Policy Report) และทำหน้าที่เป็น **AI Policy Advisor** ให้คำปรึกษาแบบเรียลไทม์

---

## 🏗️ โครงสร้างสถาปัตยกรรม Multi-Agent (Architecture)

```
                       ┌──────────────────────────────────────────────┐
                       │       GeoTransitX AI Orchestrator           │
                       └──────────────────────┬───────────────────────┘
                                              │
        ┌──────────────────┬──────────────────┼──────────────────┬──────────────────┐
        ▼                  ▼                  ▼                  ▼                  ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  DataAgent   │   │   AIAgent    │   │   LLMAgent   │   │   VizAgent   │   │  API Backend │
├──────────────┤   ├──────────────┤   ├──────────────┤   ├──────────────┤   ├──────────────┤
│• Orthophoto  │   │• Tiled YOLO  │   │• OpenTyphoon │   │• Leaflet GIS │   │• FastAPI     │
│  Ingestion   │   │  Detection   │   │  LLM (30B)   │   │  DigitalTwin │   │• REST Endpt  │
│• PDF Report  │   │• Road Graph  │   │• Auto Policy │   │• 24h Flow    │   │• Static File │
│  Parsing     │   │• Smart Park  │   │  Report (TH) │   │  Simulation  │   │  Hosting     │
│• WGS84 GeoRef│   │• 24h Traffic │   │• AI Advisor  │   │• Analytics   │   │• Vercel Ready│
│• GCP Errors  │   │  Simulation  │   │  Chatbot     │   │  Dashboard   │   │              │
└──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘
```

---

## 📊 สรุปผลการวิเคราะห์และสถิติสำคัญ (Key Survey & Traffic Insights)

| ตัวชี้วัด (Key Indicator) | ค่าที่ได้จากการวิเคราะห์จริง | หมายเหตุ / มาตรฐาน |
| :--- | :--- | :--- |
| **พื้นที่สำรวจโดรน (Survey Area)** | **60,395 ตร.ม. (0.0604 km²)** | สนามบินบางพระ จ.ชลบุรี (EEC Corridor) |
| **ความละเอียดภาพ (GSD)** | **2.62 ซม./พิกเซล** | ความละเอียดสูงพิเศษ (Ultra-HD Orthophoto) |
| **ความแม่นยำพิกัด 3D (GCP RMS)** | **0.013 เมตร (1.3 เซนติเมตร)** | CE90 ทางราบ: 2.1 ซม., LE90 แนวดิ่ง: 1.2 ซม. |
| **วัตถุตรวจจับด้วย GeoAI** | **30 รายการ** | รถยนต์, รถบรรทุกบริการ, เครื่องบินฝึกบิน, บุคลากร |
| **ปริมาณจราจรรายวัน (Daily Flow)** | **4,820 คัน/วัน** | แบบจำลอง Stochastic Flow Simulation |
| **จุดคอขวดวิกฤตเช้า (Morning Peak)** | **08:15 น. (860 vph)** | LOS D (ความเร็วเฉลี่ย 24.5 กม./ชม.) |
| **จุดคอขวดวิกฤตเย็น (Evening Peak)** | **17:30 น. (940 vph)** | LOS D/E (ความเร็วลดลงเหลือ 18.2 กม./ชม.) |
| **การปล่อยคาร์บอน (Daily CO2)** | **1,420.5 kg-CO2/วัน** | ลดได้ 22% เมื่อใช้ Feeder EV Shuttle |

---

## 🚀 วิธีการติดตั้งและรันระบบ (Quick Start Guide)

### 1. โคลนและตั้งค่าสภาพแวดล้อม
```bash
git clone https://github.com/kchayta32/GeoTransitX.git
cd GeoTransitX
```

### 2. รันระบบผ่าน Python Orchestrator (แบบครบวงจร)
```bash
# รัน Pipeline ทั้งหมดและเปิด Web Dashboard อัตโนมัติ:
python run.py

# หรือรันเฉพาะ Pipeline ประมวลผลข้อมูล:
python run.py --pipeline

# หรือรันเฉพาะ Web Server:
python run.py --server --port 8000
```
เปิดบราวเซอร์ที่: **`http://localhost:8000`**

### 3. รันผ่าน Next.js Web App (สำหรับ Vercel Deployment)
```bash
cd web
npm install
npm run dev
```
เปิดบราวเซอร์ที่: **`http://localhost:3000`**

---

## 📑 ฟังก์ชันเด่นของระบบ (Key Features)

### 1. 🗺️ แผนที่ GIS & Digital Twin (Interactive Map)
- ซ้อนทับภาพถ่ายโดรน **Orthophoto (ODX v3.8.2)** บนแผนที่ดาวเทียมอย่างแม่นยำ
- ปรับระดับความโปร่งใส (Opacity Slider) ได้แบบเรียลไทม์
- เลเยอร์ตรวจจับวัตถุ GeoAI พร้อม Bounding Box พิกัด WGS84 และค่าความเชื่อมั่น (Confidence)
- แสดงจุดควบคุมภาคพื้นดิน **GCP (gcp01 - gcp05)** พร้อมค่าความคลาดเคลื่อน 3 มิติ

### 2. 🚦 แบบจำลองการจราจรเชิงคาดการณ์ 24 ชั่วโมง (Traffic Simulation)
- แถบเลื่อนเวลา (Scrubber) ตั้งแต่ 06:00 ถึง 22:00 น.
- ปุ่ม Play/Pause และปรับความเร็วจำลอง (1x, 2x, 5x, 10x)
- แอนิเมชันอนุภาคยานพาหนะและเครื่องบินเคลื่อนที่จริงตามโครงข่ายเส้นทาง
- ป้ายเตือนจุดคอขวดอัตโนมัติ (**Bottleneck Chokepoint Alert**) ในช่วงเวลาเร่งด่วน

### 3. 📊 แดชบอร์ดสถิติ & การจัดการลานจอด (Smart Parking Analytics)
- กราฟเปรียบเทียบปริมาณจราจรกับความเร็วเดินทาง (Traffic Volume vs. Speed Profile)
- การวิเคราะห์การครองพื้นที่ลานจอดรถ (Terminal Parking, North Hangar, Apron Bay)
- รายงานสถิติกล้องโดรนและพารามิเตอร์การฟื้นฟูภาพถ่าย 3 มิติ

### 4. 📑 รายงานเชิงนโยบายระดับผู้บริหาร (Typhoon Auto Policy Report)
- รายงานภาษาไทยฉบับสมบูรณ์ที่สังเคราะห์โดย **OpenTyphoon LLM**
- ครอบคลุม: บทสรุปผู้บริหาร, การวินิจฉัยจุดคอขวด, ยุทธศาสตร์ Smart Parking, แผนพัฒนาระบบ Feeder Shuttle สุขุมวิท-EEC, และ ESG Green Mobility Roadmap 3 ระยะ
- รองรับการ Export เป็น PDF และคัดลอก Markdown

### 5. 🤖 Typhoon AI Policy Advisor (Chatbot)
- สนทนาสดกับโมเดล **`typhoon-v2.5-30b-a3b-instruct`**
- ถามตอบปัญหาการจราจร ขอคำแนะนำเชิงเทคนิค และแนวทางการแก้ปัญหาพื้นที่เฉพาะ

---

## ☁️ การ Deploy สู่ Cloud และ Vercel (Deployment)

### Vercel Deployment (Frontend):
```bash
# ติดตั้ง Vercel CLI
npm install -g vercel

# Deploy ไปยัง Vercel
cd web
vercel --prod
```

### Google Cloud (GCP) Deployment:
- **Cloud Run / Compute Engine**: รองรับการรัน `python_pipeline/server.py` เป็นคอนเทนเนอร์ FastAPI
- **Cloud Storage Bucket**: `gs://geoai-traffic-data` สำหรับจัดเก็บไฟล์ภาพถ่าย Orthophoto ขนาดใหญ่

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)
```
GeoTransitX/
├── Bang-Phra-Airport-8-26-2026-orthophoto.tif   # Raw Drone Orthophoto (GeoTIFF)
├── Bang-Phra-Airport-8-26-2026-report.pdf       # Photogrammetry GCP Quality Report
├── run.py                                       # Unified Launcher & Orchestrator CLI
├── python_pipeline/
│   ├── config.py                                # System Configuration & API Keys
│   ├── data_agent.py                            # DataAgent: Ingestion & Georeferencing
│   ├── ai_agent.py                              # AIAgent: YOLO Detection & Simulation
│   ├── llm_agent.py                             # LLMAgent: Typhoon LLM Policy Synthesis
│   ├── orchestrator.py                          # Primary Agent Pipeline Coordinator
│   └── server.py                                # FastAPI Server & REST Endpoints
├── web/
│   ├── package.json                             # Web Dependencies & Scripts
│   ├── vercel.json                              # Vercel Deployment Configuration
│   ├── public/
│   │   ├── index.html                           # Standalone Interactive Dashboard SPA
│   │   └── data/
│   │       ├── orthophoto_web.png               # Web-Optimized Orthophoto Overlay
│   │       ├── dataset_metadata.json            # Survey & Georeferencing Metadata
│   │       ├── detections.geojson               # GeoAI Object Detections
│   │       ├── network.geojson                  # Road & Runway Network
│   │       ├── parking.geojson                  # Parking Zones & Occupancy
│   │       ├── gcps.geojson                     # Ground Control Points
│   │       ├── traffic_simulation.json          # 24-Hour Predictive Model Data
│   │       └── policy_report.json               # Typhoon LLM Executive Report
│   └── src/                                     # Next.js 14 React Source Code
└── README.md
```

---

## 👥 Multi-Agent Engineering Team
- **Primary Agent**: GeoTransitX AI Orchestrator
- **Sub-Agent 1**: DataAgent (Drone Ingestion & Georeferencing)
- **Sub-Agent 2**: AIAgent (GeoAI YOLO & Predictive Traffic Modeling)
- **Sub-Agent 3**: LLMAgent (Typhoon LLM Policy Intelligence)
- **Sub-Agent 4**: VizAgent (Interactive Geospatial Visualization)
