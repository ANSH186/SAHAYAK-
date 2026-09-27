import os
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.logging import logger
from app.api.v1.api import api_router

app = FastAPI(
    title="SAHAYAK API",
    description="Intelligent Campus Lost & Found Backend Platform for National Institute of Engineering (NIE), Mysuru",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if settings.CORS_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount local upload directory if it exists
uploads_dir = settings.STORAGE_LOCAL_DIR
try:
    os.makedirs(uploads_dir, exist_ok=True)
    app.mount("/api/v1/uploads", StaticFiles(directory=uploads_dir), name="uploads")
    app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads_root")
except Exception as e:
    logger.warning(f"Static uploads mounting deferred or unavailable: {e}")

# Startup event for automatic database schema creation & seeding
@app.on_event("startup")
def startup_event():
    try:
        from app.db.init_data import auto_init_database
        auto_init_database()
    except Exception as e:
        logger.error(f"Startup DB init error: {e}")

# Include API v1 router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


# Standard Root Health Checks
@app.get("/health", tags=["Health"])
@app.get("/api/health", tags=["Health"])
@app.get("/api", tags=["Health"])
def root_health():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "version": "1.0.0"
    }


# Standard Global Error Handlers (Enforcing ApiResponse shape and preventing stack trace leaks)
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "data": None,
            "error": {
                "code": f"HTTP_{exc.status_code}",
                "message": exc.detail if isinstance(exc.detail, str) else str(exc.detail)
            },
            "meta": {}
        }
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception at {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "data": None,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred. Please try again or contact support."
            },
            "meta": {}
        }
    )
