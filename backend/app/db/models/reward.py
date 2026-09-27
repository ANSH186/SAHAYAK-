from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.session import Base


class RewardTransaction(Base):
    __tablename__ = "reward_transactions"

    id = Column(String(64), primary_key=True, index=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    case_id = Column(String(64), ForeignKey("verification_cases.id", ondelete="SET NULL"), nullable=True, index=True)
    points = Column(Integer, nullable=False)
    reason = Column(String(255), nullable=False)
    badge_awarded = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    user = relationship("User", back_populates="reward_transactions")
    case = relationship("VerificationCase")


class Milestone(Base):
    __tablename__ = "milestones"

    id = Column(String(64), primary_key=True, index=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    badge_code = Column(String(64), nullable=False)
    description = Column(Text, nullable=True)
    certificate_number = Column(String(64), unique=True, nullable=True)
    achieved_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User")
