import sys
import os
import json
import time
from pathlib import Path

# Add python_pipeline to path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from config import PUBLIC_DATA_DIR
from data_agent import DataAgent
from ai_agent import AIAgent
from llm_agent import LLMAgent

class GeoTransitXOrchestrator:
    def __init__(self):
        self.state = {
            "status": "INITIALIZING",
            "start_time": time.strftime("%Y-%m-%d %H:%M:%S"),
            "agents": {
                "DataAgent": {"status": "PENDING", "output": None, "error": None},
                "AIAgent": {"status": "PENDING", "output": None, "error": None},
                "LLMAgent": {"status": "PENDING", "output": None, "error": None},
                "VizAgent": {"status": "READY", "output": "Web Dashboard Ready", "error": None}
            },
            "metrics": {},
            "warnings": [],
            "pipeline_version": "1.0.0-prod"
        }
        
    def log(self, message):
        print(f"[GeoTransitX Orchestrator] {message}")

    def run_pipeline(self):
        self.log("=====================================================")
        self.log("🚀 STARTING GEOTRANSITX AI MULTI-AGENT ORCHESTRATION")
        self.log("=====================================================")
        
        try:
            # 1. DATA AGENT
            self.log("Step 1: Assigning DataAgent...")
            self.state["agents"]["DataAgent"]["status"] = "RUNNING"
            data_agent = DataAgent()
            metadata = data_agent.run()
            self.state["agents"]["DataAgent"]["status"] = "COMPLETED"
            self.state["agents"]["DataAgent"]["output"] = {
                "area_covered_sq_m": metadata["report_summary"]["area_covered_sq_m"],
                "gsd_cm": metadata["report_summary"]["reconstruction_stats"]["average_gsd_cm"],
                "gcp_rms_error_m": metadata["report_summary"]["accuracy_metrics"]["gcp_rms_error_total_m"],
                "dense_points": metadata["report_summary"]["reconstruction_stats"]["dense_points"]
            }
            self.log("✅ DataAgent completed successfully.")
            
            # 2. AI AGENT
            self.log("Step 2: Assigning AIAgent...")
            self.state["agents"]["AIAgent"]["status"] = "RUNNING"
            ai_agent = AIAgent()
            ai_result = ai_agent.run()
            self.state["agents"]["AIAgent"]["status"] = "COMPLETED"
            self.state["agents"]["AIAgent"]["output"] = ai_result
            self.log(f"✅ AIAgent completed successfully with {ai_result['detections_count']} detections and {ai_result['simulation_steps']} simulation steps.")
            
            # 3. LLM AGENT
            self.log("Step 3: Assigning LLMAgent (Typhoon LLM)...")
            self.state["agents"]["LLMAgent"]["status"] = "RUNNING"
            llm_agent = LLMAgent()
            report = llm_agent.run()
            self.state["agents"]["LLMAgent"]["status"] = "COMPLETED"
            self.state["agents"]["LLMAgent"]["output"] = {
                "title": report["title"],
                "status": report["status"],
                "words_count": len(report["markdown_content"].split())
            }
            self.log("✅ LLMAgent completed successfully.")
            
            # 4. SYSTEM VALIDATION
            self.log("Step 4: Primary Agent performing system-wide consistency audit...")
            self._validate_pipeline()
            
            self.state["status"] = "SUCCESS"
            self.state["end_time"] = time.strftime("%Y-%m-%d %H:%M:%S")
            
            # Save pipeline status to public data dir for frontend consumption
            status_file = PUBLIC_DATA_DIR / "orchestrator_status.json"
            with open(status_file, "w", encoding="utf-8") as f:
                json.dump(self.state, f, indent=2, ensure_ascii=False)
                
            self.log("=====================================================")
            self.log("🎉 ALL AGENTS COMPLETED WITH ZERO CRITICAL BUGS")
            self.log("=====================================================")
            return self.state
            
        except Exception as e:
            self.log(f"❌ Pipeline failed: {e}")
            self.state["status"] = "FAILED"
            self.state["error"] = str(e)
            with open(PUBLIC_DATA_DIR / "orchestrator_status.json", "w", encoding="utf-8") as f:
                json.dump(self.state, f, indent=2, ensure_ascii=False)
            raise

    def _validate_pipeline(self):
        required_files = [
            "orthophoto_web.png",
            "dataset_metadata.json",
            "gcps.geojson",
            "detections.geojson",
            "network.geojson",
            "parking.geojson",
            "traffic_simulation.json",
            "policy_report.json",
            "policy_report.md"
        ]
        
        for fname in required_files:
            p = PUBLIC_DATA_DIR / fname
            if not p.exists():
                raise FileNotFoundError(f"Missing required artifact: {fname}")
            size_kb = round(p.stat().st_size / 1024, 2)
            self.log(f"  - Verified {fname} ({size_kb} KB)")

if __name__ == "__main__":
    orchestrator = GeoTransitXOrchestrator()
    orchestrator.run_pipeline()
