from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

# Configure SQLite vs PostgreSQL parameters
db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# Auto-enable SSL for cloud PostgreSQL (Supabase / Neon)
if db_url.startswith("postgresql") and "sslmode=" not in db_url and "localhost" not in db_url and "127.0.0.1" not in db_url:
    separator = "&" if "?" in db_url else "?"
    db_url = f"{db_url}{separator}sslmode=require"

connect_args = {}
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    db_url,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

_db_initialized = False


def ensure_db_initialized():
    global _db_initialized
    if not _db_initialized:
        _db_initialized = True
        try:
            from app.db.init_data import auto_init_database
            auto_init_database()
        except Exception as e:
            import logging
            logging.getLogger("sahayak").error(f"Lazy DB init error: {e}")


def get_db():
    ensure_db_initialized()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

