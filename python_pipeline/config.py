import os
from pathlib import Path

# Base Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR
PUBLIC_DATA_DIR = BASE_DIR / "web" / "public" / "data"
PUBLIC_DATA_DIR.mkdir(parents=True, exist_ok=True)

# Input Files
ORTHOPHOTO_PATH = BASE_DIR / "Bang-Phra-Airport-8-26-2026-orthophoto.tif"
REPORT_PDF_PATH = BASE_DIR / "Bang-Phra-Airport-8-26-2026-report.pdf"

# Typhoon LLM Config
TYPHOON_API_KEY = os.getenv("TYPHOON_API_KEY", "sk-ZtLbj1CsBusuCbW0LPbNE2UWOJpqTKW9AIteX7bTzV9CaOTE")
TYPHOON_BASE_URL = "https://api.opentyphoon.ai/v1"
TYPHOON_MODEL = "typhoon-v2.5-30b-a3b-instruct"

# UTM Projection Info (Bang Phra Airport - WGS84 UTM Zone 47N)
UTM_ZONE = 47
UTM_NORTHERN = True
