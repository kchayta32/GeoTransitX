import sys
import json
import os
from pathlib import Path

# Add pipeline directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import uvicorn
import requests

from config import (
    PUBLIC_DATA_DIR,
    TYPHOON_API_KEY,
    TYPHOON_BASE_URL,
    TYPHOON_MODEL
)

app = FastAPI(
    title="GeoTransitX AI API & Dashboard",
    description="Predictive Traffic & Transit Management System Backend powered by GeoAI & Typhoon LLM",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    messages: list
    max_tokens: int = 1500
    temperature: float = 0.3

# Serve static data assets
app.mount("/data", StaticFiles(directory=str(PUBLIC_DATA_DIR)), name="data")

@app.get("/api/health")
def health_check():
    return {
        "system": "GeoTransitX",
        "status": "ONLINE",
        "model": TYPHOON_MODEL,
        "location": "Bang Phra Airport (สนามบินบางพระ), Chon Buri",
        "agents": {
            "DataAgent": "OPERATIONAL",
            "AIAgent": "OPERATIONAL",
            "LLMAgent": "OPERATIONAL",
            "VizAgent": "OPERATIONAL"
        }
    }

@app.get("/api/metadata")
def get_metadata():
    p = PUBLIC_DATA_DIR / "dataset_metadata.json"
    if not p.exists():
        raise HTTPException(status_code=404, detail="Metadata not found")
    with open(p, "r", encoding="utf-8") as f:
        return json.load(f)

@app.get("/api/detections")
def get_detections():
    p = PUBLIC_DATA_DIR / "detections.geojson"
    if not p.exists():
        raise HTTPException(status_code=404, detail="Detections not found")
    with open(p, "r", encoding="utf-8") as f:
        return json.load(f)

@app.get("/api/network")
def get_network():
    p = PUBLIC_DATA_DIR / "network.geojson"
    if not p.exists():
        raise HTTPException(status_code=404, detail="Network not found")
    with open(p, "r", encoding="utf-8") as f:
        return json.load(f)

@app.get("/api/parking")
def get_parking():
    p = PUBLIC_DATA_DIR / "parking.geojson"
    if not p.exists():
        raise HTTPException(status_code=404, detail="Parking not found")
    with open(p, "r", encoding="utf-8") as f:
        return json.load(f)

@app.get("/api/gcps")
def get_gcps():
    p = PUBLIC_DATA_DIR / "gcps.geojson"
    if not p.exists():
        raise HTTPException(status_code=404, detail="GCPs not found")
    with open(p, "r", encoding="utf-8") as f:
        return json.load(f)

@app.get("/api/simulation")
def get_simulation():
    p = PUBLIC_DATA_DIR / "traffic_simulation.json"
    if not p.exists():
        raise HTTPException(status_code=404, detail="Simulation data not found")
    with open(p, "r", encoding="utf-8") as f:
        return json.load(f)

@app.get("/api/report")
def get_report():
    p = PUBLIC_DATA_DIR / "policy_report.json"
    if not p.exists():
        raise HTTPException(status_code=404, detail="Policy report not found")
    with open(p, "r", encoding="utf-8") as f:
        return json.load(f)

@app.post("/api/chat")
def chat_with_typhoon(req: ChatRequest):
    headers = {
        "Authorization": f"Bearer {TYPHOON_API_KEY}",
        "Content-Type": "application/json"
    }
    
    system_prompt = (
        "คุณคือ GeoTransitX AI Advisor ผู้เชี่ยวชาญด้านการวางแผนจราจรอัจฉริยะ (Smart Mobility) "
        "วิเคราะห์ข้อมูลจากภาพถ่ายโดรนความละเอียด 2.62 cm/px ณ สนามบินบางพระ จ.ชลบุรี (EEC Zone) "
        "ตรวจจับวัตถุ 30 รายการ, รถ 4,820 คัน/วัน, Peak 17:30 น. (940 vph), LOS D/E, ดีเลย์ 8.5 นาที "
        "ตอบคำถามเป็นภาษาไทยอย่างกระชับ สุภาพ และมีข้อมูลเชิงสถิติรองรับ"
    )
    
    formatted_messages = [{"role": "system", "content": system_prompt}] + req.messages
    payload = {
        "model": TYPHOON_MODEL,
        "messages": formatted_messages,
        "max_tokens": req.max_tokens,
        "temperature": req.temperature
    }
    
    try:
        res = requests.post(f"{TYPHOON_BASE_URL}/chat/completions", headers=headers, json=payload, timeout=60)
        res.raise_for_status()
        data = res.json()
        return {
            "reply": data["choices"][0]["message"]["content"],
            "model": TYPHOON_MODEL
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Root web index serving
@app.get("/")
def serve_dashboard():
    index_path = Path(__file__).resolve().parent.parent / "web" / "public" / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path))
    return {"message": "GeoTransitX API Running. Please place index.html in web/public."}

if __name__ == "__main__":
    print("Starting GeoTransitX Server on http://localhost:8000 ...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
