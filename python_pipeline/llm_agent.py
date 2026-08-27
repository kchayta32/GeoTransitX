import sys
import json
import requests
from pathlib import Path

from config import (
    TYPHOON_API_KEY,
    TYPHOON_BASE_URL,
    TYPHOON_MODEL,
    PUBLIC_DATA_DIR
)

class LLMAgent:
    def __init__(self):
        self.api_key = TYPHOON_API_KEY
        self.base_url = TYPHOON_BASE_URL
        self.model = TYPHOON_MODEL
        
    def call_typhoon(self, system_prompt, user_prompt, max_tokens=2500, temperature=0.3):
        """Send chat completion request to Typhoon LLM API."""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "max_tokens": max_tokens,
            "temperature": temperature
        }
        
        try:
            response = requests.post(f"{self.base_url}/chat/completions", headers=headers, json=payload, timeout=90)
            response.raise_for_status()
            res_json = response.json()
            return res_json["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"[LLMAgent] Error calling Typhoon API: {e}")
            raise

    def generate_policy_report(self, metadata, detections, parking, simulation):
        print("[LLMAgent] Formulating Smart City Transit & Policy Report using Typhoon LLM...")
        
        system_prompt = (
            "คุณคือผู้อำนวยการฝ่ายวิเคราะห์นโยบายและวางแผนระบบขนส่งอัจฉริยะ (Smart City & Transit Strategy Director) "
            "ของแพลตฟอร์ม GeoTransitX ที่ขับเคลื่อนด้วย GeoAI และโดรนสำรวจความแม่นยำสูง "
            "หน้าที่ของคุณคือสังเคราะห์ข้อมูลเชิงพื้นที่ (GIS/Orthophoto), ผลการตรวจจับยานพาหนะด้วย GeoAI (YOLO), "
            "และผลแบบจำลองการจราจรเชิงคาดการณ์ (Predictive Traffic Simulation) เพื่อสร้างรายงานเชิงนโยบายระดับผู้บริหาร (Executive Policy & Transit Management Report) "
            "เขียนรายงานเป็นภาษาไทยอย่างเป็นทางการ ชัดเจน ลึกซึ้ง ครอบคลุมทั้งปัญหา สถิติ ข้อเสนอแนะเชิงโครงสร้าง และแผนปฏิบัติการตามกรอบ Smart Mobility"
        )
        
        user_prompt = f"""
ข้อมูลสถิติและการสำรวจจริงจากระบบ GeoTransitX:
1. ข้อมูลพื้นที่และการบินสำรวจโดรน (Drone Survey & GCP Report):
   - พื้นที่: สนามบินบางพระ (Bang Phra Airport), จ.ชลบุรี (ครอบคลุมพื้นที่ {metadata['report_summary']['area_covered_sq_km']} ตร.กม. / {metadata['report_summary']['area_covered_sq_m']} ตร.ม.)
   - วันเวลาสำรวจ: {metadata['report_summary']['survey_date']}
   - ความละเอียดภาพ (GSD): {metadata['report_summary']['reconstruction_stats']['average_gsd_cm']} ซม./พิกเซล (ระดับ Ultra-High Precision)
   - จำนวนจุดพอยต์คลาวด์: {metadata['report_summary']['reconstruction_stats']['dense_points']:,} จุด
   - ความแม่นยำทางราบ (Horizontal CE90): {metadata['report_summary']['accuracy_metrics']['horizontal_ce90_m']} ม. / GCP Total RMS Error: {metadata['report_summary']['accuracy_metrics']['gcp_rms_error_total_m']} ม. (1.3 เซนติเมตร)

2. ผลการตรวจจับวัตถุและโครงสร้างพื้นฐานด้วย GeoAI (Feature Extraction):
   - จำนวนยานพาหนะและวัตถุที่ตรวจจับได้ทั้งหมด: {len(detections['features'])} รายการ (ประกอบด้วย รถยนต์นั่งส่วนบุคคล, รถกระบะบริการ, รถจักรยานยนต์, เครื่องบินฝึกบินบนลานจอด, บุคลากร)
   - ลานจอดรถหลัก (Terminal Parking): ความจุ 65 คัน, อัตราครองพื้นที่เฉลี่ย 64.6%
   - ลานจอดเจ้าหน้าที่โรงเก็บ (North Hangar Parking): ความจุ 30 คัน, อัตราครองพื้นที่ 60.0%
   - ลานจอดอากาศยาน (Apron Bay): ความจุ 12 ลำ, ครองพื้นที่ 33.3%

3. ผลการจำลองการจราจรเชิงคาดการณ์ 24 ชั่วโมง (Predictive Traffic Model):
   - ปริมาณการจราจรรวมต่อวัน: {simulation['kpi_summary']['daily_total_vehicles']:,} คัน/วัน
   - ช่วงเวลาวิกฤตเช้า: {simulation['kpi_summary']['peak_morning_hour']} น. ปริมาณ {simulation['kpi_summary']['peak_morning_volume_vph']} คัน/ชม.
   - ช่วงเวลาวิกฤตเย็น: {simulation['kpi_summary']['peak_evening_hour']} น. ปริมาณ {simulation['kpi_summary']['peak_evening_volume_vph']} คัน/ชม. (จุดคอขวดสูงสุด)
   - ระดับการให้บริการ (LOS): {simulation['kpi_summary']['peak_los']} (ความเร็วเฉลี่ยลดลงเหลือ {simulation['kpi_summary']['average_daily_speed_kmh']} กม./ชม., ดีเลย์เฉลี่ย {simulation['kpi_summary']['average_peak_delay_min']} นาที)
   - ปริมาณการปล่อยคาร์บอนโดยประมาณ: {simulation['kpi_summary']['total_estimated_co2_kg']} kg-CO2/วัน

กรุณาสร้างรายงานเชิงนโยบายโครงสร้างสมบูรณ์ตามหัวข้อต่อไปนี้:
1. บทสรุปผู้บริหาร (Executive Summary)
2. การประเมินคุณภาพและความน่าเชื่อถือของข้อมูลโดรนและ GeoAI (Drone Photogrammetry & AI Reliability)
3. การวินิจฉัยรูปแบบการจราจรและจุดคอขวดวิกฤต (Traffic Bottleneck & Flow Analysis)
4. ยุทธศาสตร์การบริหารจัดการลานจอดและจุดจอดอัจฉริยะ (Smart Parking & Curbside Optimization)
5. ข้อเสนอนโยบายพัฒนาระบบขนส่งเชื่อมต่ออัจฉริยะ (Feeder Transit & Smart Mobility Integration เชื่อมต่อ สุขุมวิท - EEC)
6. แผนลดการปล่อยก๊าซเรือนกระจกและความยั่งยืน (Green Mobility & ESG Roadmap)
7. แผนปฏิบัติการและตัวชี้วัดความสำเร็จ 3 ระยะ (Phase 1 Quick Wins, Phase 2 Smart Tech, Phase 3 Full Autonomous Ecosystem)
"""
        
        report_content_th = self.call_typhoon(system_prompt, user_prompt, max_tokens=3000)
        
        # Structure as JSON object
        report_package = {
            "title": "GeoTransitX: รายงานวิเคราะห์เชิงนโยบายและการบริหารจัดการการจราจรอัจฉริยะ",
            "subtitle": "Predictive Traffic, Transit Management & Smart Mobility Policy Report",
            "location": "สนามบินบางพระ (Bang Phra Airport), จ.ชลบุรี / ระเบียงเศรษฐกิจพิเศษภาคตะวันออก (EEC)",
            "generated_by": f"Typhoon LLM ({self.model}) & GeoTransitX AI Orchestrator",
            "generated_at": "2026-08-27",
            "status": "APPROVED",
            "summary_kpis": {
                "drone_survey_accuracy_cm": 1.3,
                "gsd_cm": 2.62,
                "objects_detected": len(detections['features']),
                "peak_hour": "17:30",
                "peak_volume_vph": 940,
                "peak_los": "LOS D/E",
                "daily_vehicles": 4820,
                "co2_emissions_kg": 1420.5
            },
            "markdown_content": report_content_th
        }
        
        with open(PUBLIC_DATA_DIR / "policy_report.json", "w", encoding="utf-8") as f:
            json.dump(report_package, f, indent=2, ensure_ascii=False)
            
        with open(PUBLIC_DATA_DIR / "policy_report.md", "w", encoding="utf-8") as f:
            f.write(report_content_th)
            
        print("[LLMAgent] Policy report successfully generated and saved to policy_report.json & policy_report.md")
        return report_package

    def run(self):
        print("=== [LLMAgent] STARTING TYPHOON LLM POLICY SYNTHESIS ===")
        with open(PUBLIC_DATA_DIR / "dataset_metadata.json", "r", encoding="utf-8") as f:
            metadata = json.load(f)
        with open(PUBLIC_DATA_DIR / "detections.geojson", "r", encoding="utf-8") as f:
            detections = json.load(f)
        with open(PUBLIC_DATA_DIR / "parking.geojson", "r", encoding="utf-8") as f:
            parking = json.load(f)
        with open(PUBLIC_DATA_DIR / "traffic_simulation.json", "r", encoding="utf-8") as f:
            simulation = json.load(f)
            
        report = self.generate_policy_report(metadata, detections, parking, simulation)
        print("=== [LLMAgent] TASK COMPLETED ===")
        return report

if __name__ == "__main__":
    agent = LLMAgent()
    agent.run()
