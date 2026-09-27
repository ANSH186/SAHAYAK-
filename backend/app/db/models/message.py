from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.session import Base


class Message(Base):
    __tablename__ = "messages"

    id = Column(String(64), primary_key=True, index=True)
    case_id = Column(String(64), ForeignKey("verification_cases.id", ondelete="CASCADE"), nullable=False, index=True)
    sender_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    sender_name = Column(String(255), nullable=False)
    sender_role = Column(String(32), default="student")
    content = Column(Text, nullable=False)
    read = Column(Boolean, default=False)
    is_system_message = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    case = relationship("VerificationCase", back_populates="messages")
    sender = relationship("User", foreign_keys=[sender_id])
