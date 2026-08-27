import sys
import time
import requests
import uvicorn
from threading import Thread
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, str(Path(__file__).resolve().parent))
from server import app

def run_server():
    uvicorn.run(app, host="127.0.0.1", port=8888, log_level="warning")

def test_endpoints():
    t = Thread(target=run_server, daemon=True)
    t.start()
    time.sleep(2)

    base_url = "http://127.0.0.1:8888"

    print("[VERIFY] Testing /api/health...")
    res = requests.get(f"{base_url}/api/health")
    assert res.status_code == 200, f"Health check failed: {res.status_code}"
    print(" -> Health check: PASS", res.json()["status"])

    print("[VERIFY] Testing /api/metadata...")
    res = requests.get(f"{base_url}/api/metadata")
    assert res.status_code == 200
    print(" -> Metadata: PASS", res.json()["location"])

    print("[VERIFY] Testing /api/detections...")
    res = requests.get(f"{base_url}/api/detections")
    assert res.status_code == 200
    det_count = len(res.json().get("features", []))
    print(f" -> Detections: PASS ({det_count} objects)")

    print("[VERIFY] Testing /api/simulation...")
    res = requests.get(f"{base_url}/api/simulation")
    assert res.status_code == 200
    steps = len(res.json().get("timeline", []))
    daily_v = res.json()["kpi_summary"]["daily_total_vehicles"]
    print(f" -> Simulation: PASS ({steps} time steps, {daily_v} daily vehicles)")

    print("[VERIFY] Testing /api/report...")
    res = requests.get(f"{base_url}/api/report")
    assert res.status_code == 200
    print(" -> Policy Report: PASS", res.json()["title"])

    print("[VERIFY] Testing GET / (Dashboard HTML)...")
    res = requests.get(f"{base_url}/")
    assert res.status_code == 200
    print(f" -> Dashboard HTML: PASS ({len(res.text)} bytes)")

    print("\n=======================================================")
    print("ALL GEOTRANSITX API & DASHBOARD TESTS PASSED (100%)")
    print("=======================================================")

if __name__ == "__main__":
    test_endpoints()
