from datetime import datetime, timezone
import enum
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.session import Base


class NotificationType(str, enum.Enum):
    MATCH_FOUND = "MATCH_FOUND"
    VERIFICATION = "VERIFICATION"
    MANUAL_REVIEW = "MANUAL_REVIEW"
    HANDOVER = "HANDOVER"
    RETURNED = "RETURNED"
    REWARD = "REWARD"
    SYSTEM = "SYSTEM"
    SECURITY = "SECURITY"


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(64), primary_key=True, index=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String(32), default=NotificationType.SYSTEM.value, index=True)
    title = Column(String(255), nullable=False)
    body = Column(Text, nullable=False)
    related_case_id = Column(String(64), nullable=True, index=True)
    link_url = Column(String(255), nullable=True)
    read = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    user = relationship("User", back_populates="notifications")
