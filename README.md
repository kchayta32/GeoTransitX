# 🛰️ GeoTransitX: Predictive Traffic & Smart Transit AI Platform
### ระบบแบบจำลองการจราจร 24 ชม. บนแผนที่ดาวเทียมจริง Google Satellite HD & สถาปัตยกรรม Asynchronous Multi-Agent

[![Live Production](https://img.shields.io/badge/Live_Demo-GeoTransitX_Vercel-10b981?style=for-the-badge&logo=vercel)](https://geotransitx.vercel.app/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14.2.21-000000?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Python 3.12](https://img.shields.io/badge/Python-3.12_AsyncIO-3776AB?style=for-the-badge&logo=python)](https://python.org/)
[![YOLOv8](https://img.shields.io/badge/AI_Vision-Ultralytics_YOLOv8-FF6F00?style=for-the-badge&logo=yolo)](https://ultralytics.com/)
[![OpenTyphoon 30B](https://img.shields.io/badge/LLM-OpenTyphoon_30B-7c3aed?style=for-the-badge)](https://opentyphoon.ai/)

---

## 🌐 เว็บแอปพลิเคชันจริง (Live Production)
* **URL**: [https://geotransitx.vercel.app/](https://geotransitx.vercel.app/)
* **พื้นที่สำรวจนำร่อง**: สนามบินบางพระ (Bang Phra Airport), จ.ชลบุรี — เขตพัฒนาพิเศษภาคตะวันออก (EEC)

---

## 🌟 ฟีเจอร์เด่นของระบบ (Key Features)

### 1. 🛰️ แบบจำลองการจราจร 24 ชม. บนแผนที่ Google Satellite HD จริง (สายฟรี 100%)
* **Interactive Leaflet Sat Engine**: ผสานภาพถ่ายดาวเทียมความละเอียดสูง **Google Satellite HD** (https://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}) และ **Google Hybrid** (lyrs=y) แบบฟรีไม่ต้องใช้ API Key
* **Dynamic Vehicle Movement**: จำลองการเคลื่อนที่ของยานพาหนะตามพิกัดถนนจริง WGS84 อย่างสมจริง (🚗 รถยนต์, 🚌 รถโดยสาร EEC, 🚚 รถบรรทุกโลจิสติกส์, ✈️ อากาศยานฝึกบิน, ⚡ รถบัสไฟฟ้า EV Shuttle)
* **24-Hour Timeline Scrubber & Speed Controls**: ควบคุมช่วงเวลาได้ 48 ช่วงเวลา (00:00 - 23:30 น.) พร้อมปุ่มเล่น/พัก, ปรับความเร็ว 1x, 2x, 5x, 10x และปุ่มลัดสู่ช่วงเวลาสำคัญ (02:00 กลางคืน, 08:00 Peak เช้า 860 vph, 12:30 ขนส่งการบิน, 17:30 Peak เย็น 940 vph)
* **Telemetry HUD**: แสดงปริมาณจราจร (vph), ความเร็วเฉลี่ย (กม./ชม.), ดีเลย์สะสม (วินาที), ระดับ LOS (A-F), การปล่อย CO2 (kg/h) และแจ้งเตือนความปลอดภัยเขต Runway Buffer

---

### 2. ⚡ ระบบจำลอง 5 สถานการณ์พิเศษ (Scenario Simulation Engine)
สามารถเลือกเปลี่ยนสถานการณ์จำลองและระบบจะคำนวณผลกระทบต่อเครือข่ายจราจรแบบ Real-Time:
1. ☀️ **วันทำงานปกติ (Baseline Flow)**: การไหลเวียนปกติในวันทำการ ปริมาณจราจร 5,420 คัน/วัน
2. 🌧️ **ฝนตกหนักและน้ำท่วมขัง (Monsoon Surge)**: ความเร็วลดลง 42%, ดีเลย์พุ่ง +115%, เกิดวิกฤต LOS E/F
3. ✈️ **งานนิทรรศการการบิน EEC (Airshow Peak)**: ปริมาณจราจรพุ่งสูง 185%, ลานจอดและ Apron หนาแน่นสูงสุด
4. 🚧 **ปิดซ่อมบำรุง Runway / ผิวทาง (Maintenance)**: บีบช่องจราจรเหลือ 1 เลน เกิดคอขวดและแจ้งเตือนความปลอดภัย
5. ⚡ **ระบบขนส่งไฟฟ้า Smart EV Feeder (Green Mobility)**: รถบัสไฟฟ้าเชื่อมต่อ EEC ลดคาร์บอนลง 65% ความเร็วเพิ่มขึ้น 15%

---

### 3. 🤖 สถาปัตยกรรม Primary Agent & Dynamic Asynchronous Subagents
ระบบทำงานด้วยสถาปัตยกรรม **Primary Supervisor + Concurrent Subagents** ที่ประมวลผลคู่ขนานแบบ Asynchronous:
* 👑 **PrimaryOrchestratorAgent**: ผู้ควบคุมหลักและจัดการคิว AsyncIO Coroutines
* 🛰️ **SatelliteVisionAgent**: ประมวลผลภาพดาวเทียม Google Sat HD + Drone Orthophoto & YOLOv8 Segmentation
* 🚦 **TrafficSimulation24hAgent**: คำนวณแบบจำลองจราจร 24 ชม. และสมการความล่าช้า BPR (Bureau of Public Roads)
* 🗺️ **GeoSpatialTwinAgent**: บริหารจัดการ Digital Twin, ผัง Land Use (u, a, f, w, m) และจุดควบคุม GCP (RMS 1.3 ซม.)
* 🤖 **OpenTyphoonLLMAgent**: สังเคราะห์นโยบาย Smart Transit ภาษาไทยด้วย OpenTyphoon 30B
* ⚡ **VizTelemetryAgent**: สตรีมข้อมูล Telemetry เชื่อมโยงกับ Scrubber และแผนที่ 60 FPS
* **Multi-Agent Command Center Hub**: แผงควบคุมสดบนเว็บแสดงสถานะ Latency, Throughput (fps), CPU %, และปุ่มสั่ง Dynamic Re-Simulation พร้อม Live Event Stream

---

### 4. 📸 ข้อมูลภาพถ่ายโดรนความแม่นยำสูง (WebODM Photogrammetry)
* **พื้นที่สำรวจ**: 60,395 ตร.ม. (สนามบินบางพระ จ.ชลบุรี)
* **ความละเอียดภาพ (GSD)**: 2.62 ซม./พิกเซล
* **ความแม่นยำ 3D GCP RMS Error**: 0.013 ม. (1.3 ซม.)
* **ความหนาแน่น Point Cloud**: 10.5 ล้านจุด (Dense 3D Mesh)
* **เขตความปลอดภัยทางวิ่ง (Runway Buffer)**: 145,056 ตร.ม. (ตามมาตรฐาน ICAO Annex 14)

---

## 🏛️ ผังโครงสร้างสถาปัตยกรรมระบบ (System Architecture)

`
+-----------------------------------------------------------------------------------+
|                        👑 PrimaryOrchestratorAgent                                |
|          (Supervisor, Async Coroutines Manager, System Consistency Audit)         |
+-----------------------------------------------------------------------------------+
       |                      |                       |                      |
       v                      v                       v                      v
+---------------+      +---------------+      +---------------+      +---------------+
| 🛰️ SatVision  |      | 🚦 TrafficSim |      | 🗺️ GeoTwin    |      | 🤖 TyphoonLLM |
|   Subagent    |      |   Subagent    |      |   Subagent    |      |   Subagent    |
| (YOLOv8 Seg + |      | (24h BPR Flow |      | (WebODM Land  |      | (OpenTyphoon  |
|  Sat HD Tile) |      | + 5 Scenario) |      |  Use + GCP)   |      |  30B Thai AI) |
+---------------+      +---------------+      +---------------+      +---------------+
       \                      /                       \                      /
        ---------------------------------------------------------------------
                                          |
                                          v
                       +-------------------------------------+
                       |        ⚡ VizTelemetryAgent          |
                       | (Real-time Stream & Map Sync Engine)|
                       +-------------------------------------+
                                          |
                                          v
                       +-------------------------------------+
                       |   🌐 GeoTransitX Web Dashboard      |
                       |  (Next.js 14 + Leaflet Google Sat)  |
                       +-------------------------------------+
`

---

## 📊 ตารางเปรียบเทียบผลการจำลอง 5 สถานการณ์ (Scenario Benchmarks)

| สถานการณ์จำลอง (Scenario) | ปริมาณจราจร Peak (vph) | ความเร็วเฉลี่ย (km/h) | ดีเลย์สะสม (วินาที) | ระดับ LOS | การปล่อย CO2 (kg/h) | สถานะความปลอดภัย Runway Buffer |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| ☀️ **วันทำงานปกติ (Normal)** | 940 | 36.4 | 142 | **LOS D** | 169.2 | ปลอดภัย (มีระบบเฝ้าระวัง) |
| 🌧️ **ฝนตกหนัก (Monsoon)** | 865 | 21.1 | 305 | **LOS E/F** | 228.4 | เฝ้าระวังพิเศษ (ผิวทางลื่น) |
| ✈️ **งานการบิน (Airshow)** | 1,739 | 23.6 | 340 | **LOS E/F** | 321.5 | มีกิจกรรมภาคพื้นหนาแน่น |
| 🚧 **ปิดซ่อมทาง (Maintenance)** | 799 | 18.2 | 369 | **LOS F** | 245.3 | ⚠️ มีการรุกล้ำแนวเขตก่อสร้าง |
| ⚡ **ขนส่งไฟฟ้า (Green EV)** | 733 | 41.8 | 85 | **LOS A/B** | 59.2 | ปลอดภัยสูงสุด (Zero Emission) |

---

## 🚀 การติดตั้งและรันในเครื่อง (Local Setup Guide)

### 1. ความต้องการของระบบ (Prerequisites)
* Node.js 18+ & npm
* Python 3.10+ (แนะนำ 3.12)
* Git

### 2. โคลนคลังโค้ด (Clone Repository)
`ash
git clone https://github.com/kchayta32/GeoTransitX.git
cd GeoTransitX
`

### 3. รันส่วนเว็บ Dashboard (Frontend)
`ash
cd web
npm install
npm run dev
`
เปิดเบราว์เซอร์ที่ http://localhost:3000

### 4. รัน Asynchronous Multi-Agent Pipeline (Backend)
`ash
# ติดตั้ง Python dependencies
pip install -r python_pipeline/requirements.txt # หรือ ultralytics pillow fastapi uvicorn requests

# รัน Multi-Agent Pipeline
python python_pipeline/orchestrator.py

# รัน API Server
python python_pipeline/server.py
`

---

## 🛠️ รายละเอียดเทคโนโลยีที่ใช้ (Tech Stack)

* **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Leaflet GIS, Recharts, Lucide Icons
* **Multi-Agent Engine**: Python AsyncIO, Concurrent ThreadPoolExecutor, Dynamic Subagents Manager
* **Computer Vision & GeoAI**: Ultralytics YOLOv8 (Instance Segmentation & Object Detection), GDAL/Rasterio
* **Photogrammetry & GIS**: WebODM, QGIS, WGS84/UTM Zone 47N Georeferencing
* **Large Language Model (LLM)**: OpenTyphoon 	yphoon-v2.5-30b-a3b-instruct
* **Basemaps**: Google Satellite HD Tile Stream (Free Tier), Google Hybrid, Esri World Imagery, Carto Dark
* **Deployment & CI/CD**: Vercel Serverless Edge Platform, GitHub Actions

---

## 👥 ผู้พัฒนาและลิขสิทธิ์ (Team & License)
* **โครงการ**: GeoTransitX — Predictive Traffic & Smart Transit AI System
* **GCP Project ID**: geoai-506806 (Project No: 334457340669)
* **ลิขสิทธิ์**: MIT License — สามารถนำไปพัฒนาต่อยอดเพื่อประโยชน์สาธารณะและเมืองอัจฉริยะ EEC
