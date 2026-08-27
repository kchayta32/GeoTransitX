import sys
import os
import argparse
import webbrowser
from pathlib import Path

# Add python_pipeline to path
sys.path.insert(0, str(Path(__file__).resolve().parent / "python_pipeline"))

def main():
    parser = argparse.ArgumentParser(description="GeoTransitX Orchestrator & Dashboard Launcher")
    parser.add_argument("--pipeline", action="store_true", help="Run multi-agent AI pipeline only")
    parser.add_argument("--server", action="store_true", help="Start web dashboard server only")
    parser.add_argument("--port", type=int, default=8000, help="Web server port (default: 8000)")
    parser.add_argument("--no-browser", action="store_true", help="Do not auto-open browser")
    args = parser.parse_args()

    print("==================================================================")
    print("🛰️  GEOTRANSITX: PREDICTIVE TRAFFIC & TRANSIT MANAGEMENT SYSTEM")
    print("    Powered by Drone Photogrammetry, GeoAI & OpenTyphoon LLM")
    print("==================================================================")

    if args.pipeline or (not args.server and not args.pipeline):
        from orchestrator import GeoTransitXOrchestrator
        orchestrator = GeoTransitXOrchestrator()
        orchestrator.run_pipeline()

    if args.server or (not args.pipeline):
        import uvicorn
        from server import app
        
        url = f"http://localhost:{args.port}"
        print(f"\n🌐 Starting GeoTransitX Interactive Web Dashboard at: {url}")
        print("   - GIS & Digital Twin: " + url + "/#map")
        print("   - Predictive Traffic Simulation: " + url + "/#simulation")
        print("   - Analytics & Smart Parking: " + url + "/#analytics")
        print("   - Typhoon LLM Policy Report: " + url + "/#report")
        print("   - AI Policy Advisor Chat: " + url + "/#chat")
        print("   - API Documentation: " + url + "/docs\n")
        
        if not args.no_browser:
            try:
                webbrowser.open(url)
            except Exception:
                pass
                
        uvicorn.run(app, host="0.0.0.0", port=args.port)

if __name__ == "__main__":
    main()
