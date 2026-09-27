import os
import sys

# Ensure backend directory and project root are in sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR)
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")

for path in [BACKEND_DIR, ROOT_DIR]:
    if path not in sys.path:
        sys.path.insert(0, path)

from app.main import app

# Export app for Vercel Serverless ASGI runtime
__all__ = ["app"]
