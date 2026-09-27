import os
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    APP_NAME: str = "SAHAYAK Backend"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"
    
    # Security & JWT
    SECRET_KEY: str = "sahayak-super-secret-key-for-nie-lost-and-found-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000"
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, list):
            return v
        return ["*"]

    # Database
    DATABASE_URL: str = "sqlite:///./sahayak.db"

    @field_validator("DATABASE_URL", mode="before")
    def assemble_db_url(cls, v: str) -> str:
        if not v:
            if os.environ.get("VERCEL"):
                return "sqlite:////tmp/sahayak.db"
            return "sqlite:///./sahayak.db"
        # Heroku/Supabase/Neon often provide 'postgres://' which SQLAlchemy 1.4+ rejects
        if v.startswith("postgres://"):
            v = v.replace("postgres://", "postgresql://", 1)
        # On Vercel, relative sqlite files in root fail because root is read-only
        if os.environ.get("VERCEL") and v.startswith("sqlite:///./"):
            return "sqlite:////tmp/sahayak.db"
        return v

    # Storage
    STORAGE_PROVIDER: str = "local"  # local, supabase, s3
    STORAGE_LOCAL_DIR: str = "/tmp/uploads" if os.environ.get("VERCEL") else os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../uploads"))
    MAX_UPLOAD_SIZE_MB: int = 10
    ALLOWED_IMAGE_MIMES: List[str] = ["image/jpeg", "image/png", "image/webp"]

    # Supabase (optional)
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_STORAGE_BUCKET: str = "sahayak-media"

    # AI & Embeddings
    AI_PROVIDER: str = "mock"  # mock, gemini, openai
    AI_API_KEY: str = ""
    EMBEDDING_PROVIDER: str = "mock"
    VISION_PROVIDER: str = "mock"

    # Matching Weights (configurable)
    MATCH_SCORE_THRESHOLD: float = 0.55
    MATCH_WEIGHT_VISUAL: float = 0.30
    MATCH_WEIGHT_TEXT: float = 0.25
    MATCH_WEIGHT_LOCATION: float = 0.20
    MATCH_WEIGHT_TIME: float = 0.15
    MATCH_WEIGHT_ATTRIBUTE: float = 0.10

    # Verification Policy
    MAX_VERIFICATION_ATTEMPTS: int = 3

    # Holding Period in Days
    DEFAULT_HOLDING_PERIOD_DAYS: int = 7

    # Campus Center Coordinates
    CAMPUS_NAME: str = "National Institute of Engineering (NIE), Mysuru"
    CAMPUS_LATITUDE: float = 12.3551
    CAMPUS_LONGITUDE: float = 76.6128


settings = Settings()
