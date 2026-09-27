from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text
from app.db.session import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(64), primary_key=True, index=True)
    actor_id = Column(String(64), nullable=True, index=True)
    actor_name = Column(String(255), nullable=True)
    actor_role = Column(String(32), default="STUDENT")
    event_type = Column(String(64), nullable=False, index=True)
    case_id = Column(String(64), nullable=True, index=True)
    status = Column(String(32), default="SUCCESS")  # SUCCESS, WARNING, FLAGGED, FAILED
    description = Column(Text, nullable=False)
    metadata_json = Column(Text, default="{}")
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
