"""Export the FastAPI OpenAPI schema to backend/openapi.json.

Used by the frontend's `npm run gen:types` to regenerate types/api.gen.ts
from the live schema — see frontend/package.json.

Usage: python scripts/export_openapi.py
"""

import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.main import app

if __name__ == "__main__":
    out_path = os.path.join(os.path.dirname(__file__), "..", "openapi.json")
    with open(out_path, "w") as f:
        json.dump(app.openapi(), f, indent=2)
    print(f"Wrote {out_path}")
