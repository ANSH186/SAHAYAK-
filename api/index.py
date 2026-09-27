import os
import sys
import traceback

# Add search directories so backend modules can always be found
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
cwd = os.getcwd()

search_dirs = [
    os.path.join(current_dir, "backend"),
    os.path.join(parent_dir, "backend"),
    os.path.join(cwd, "backend"),
    os.path.join(cwd, "SAHAYAK-2acc1506e089600be13f91777ba3a19e169c7f18", "backend"),
    current_dir,
    parent_dir,
    cwd
]

for d in search_dirs:
    if os.path.exists(d) and d not in sys.path:
        sys.path.insert(0, d)

try:
    from app.main import app
except Exception as e:
    tb = traceback.format_exc()
    print("FATAL ERROR IMPORTING APP:\n" + tb, flush=True)
    from fastapi import FastAPI
    from fastapi.responses import PlainTextResponse
    app = FastAPI(title="SAHAYAK Debug Fallback")

    @app.api_route("/{full_path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE"])
    async def debug_catchall(full_path: str):
        return PlainTextResponse(f"FastAPI Backend Import Error on Vercel:\n{tb}", status_code=500)

__all__ = ["app"]
