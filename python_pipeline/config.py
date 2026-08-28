import os
from pathlib import Path

# Base Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR
PUBLIC_DATA_DIR = BASE_DIR / "web" / "public" / "data"
PUBLIC_DATA_DIR.mkdir(parents=True, exist_ok=True)

# Helper to find file in organized or legacy path
def resolve_path(*candidates):
    for c in candidates:
        if c.exists():
            return c
    return candidates[0]

# Input Files (Checked in data/raw/ then root)
ORTHOPHOTO_PATH = resolve_path(
    BASE_DIR / "data" / "raw" / "Bang-Phra-Airport-8-26-2026-orthophoto.tif",
    BASE_DIR / "Bang-Phra-Airport-8-26-2026-orthophoto.tif"
)
REPORT_PDF_PATH = resolve_path(
    BASE_DIR / "data" / "raw" / "Bang-Phra-Airport-8-26-2026-report.pdf",
    BASE_DIR / "Bang-Phra-Airport-8-26-2026-report.pdf"
)

# WebODM Input Files (Checked in data/webodm/ then WebODM/)
WEBODM_DIR = resolve_path(BASE_DIR / "data" / "webodm", BASE_DIR / "WebODM")
LAND_USE_GEOJSON = resolve_path(WEBODM_DIR / "land_use.geojson", BASE_DIR / "WebODM" / "land_use.geojson")
BUFFER_RUNWAY_GEOJSON = resolve_path(WEBODM_DIR / "Buffer_Runway.geojson", BASE_DIR / "WebODM" / "Buffer_Runway.geojson")
SKETCHES_RUNWAY_GEOJSON = resolve_path(WEBODM_DIR / "Sketches_Runway.geojson", BASE_DIR / "WebODM" / "Sketches_Runway.geojson")
SKETCHES_LOTUS_GEOJSON = resolve_path(WEBODM_DIR / "Sketches_Lotus.geojson", BASE_DIR / "WebODM" / "Sketches_Lotus.geojson")

# Models Directory
MODELS_DIR = BASE_DIR / "models"

# Typhoon LLM Config
TYPHOON_API_KEY = os.getenv("TYPHOON_API_KEY", "sk-ZtLbj1CsBusuCbW0LPbNE2UWOJpqTKW9AIteX7bTzV9CaOTE")
TYPHOON_BASE_URL = "https://api.opentyphoon.ai/v1"
TYPHOON_MODEL = "typhoon-v2.5-30b-a3b-instruct"

# UTM Projection Info (Bang Phra Airport - WGS84 UTM Zone 47N)
UTM_ZONE = 47
UTM_NORTHERN = True

