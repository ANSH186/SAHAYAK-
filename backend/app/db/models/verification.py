from datetime import datetime, timezone
import enum
from sqlalchemy import Column, String, Boolean, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.session import Base


class VerificationStatus(str, enum.Enum):
    AWAITING_CLAIMANT = "AWAITING_CLAIMANT"
    UNDER_AI_CHECK = "UNDER_AI_CHECK"
    MANUAL_STAFF_REVIEW = "MANUAL_STAFF_REVIEW"
    OWNERSHIP_CONFIRMED = "OWNERSHIP_CONFIRMED"
    CLAIM_DENIED = "CLAIM_DENIED"
    UNDER_REVIEW = "UNDER_REVIEW"
    VERIFIED = "VERIFIED"
    PENDING = "PENDING"


class VerificationCase(Base):
    __tablename__ = "verification_cases"

    id = Column(String(64), primary_key=True, index=True)
    match_id = Column(String(64), ForeignKey("potential_matches.id", ondelete="SET NULL"), nullable=True, index=True)
    lost_report_id = Column(String(64), ForeignKey("item_reports.id", ondelete="CASCADE"), nullable=False, index=True)
    found_report_id = Column(String(64), ForeignKey("item_reports.id", ondelete="CASCADE"), nullable=False, index=True)
    
    claimant_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    finder_id = Column(String(64), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    
    status = Column(String(32), default=VerificationStatus.AWAITING_CLAIMANT.value, index=True)
    confidence_rating = Column(String(32), default="Moderate")  # High, Moderate, Inconclusive, Flagged
    
    # Attempt rate-limiting
    attempts_count = Column(Integer, default=0)
    max_attempts = Column(Integer, default=3)
    
    # Manual Review
    manual_review_notes = Column(Text, nullable=True)
    assigned_staff = Column(String(255), nullable=True)
    
    # Handover OTP generated upon confirmation
    handover_otp = Column(String(16), nullable=True)
    handover_location = Column(String(255), nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    lost_report = relationship("ItemReport", foreign_keys=[lost_report_id])
    found_report = relationship("ItemReport", foreign_keys=[found_report_id])
    claimant = relationship("User", foreign_keys=[claimant_id])
    finder = relationship("User", foreign_keys=[finder_id])
    questions = relationship("VerificationQuestion", back_populates="case", cascade="all, delete-orphan")
    attempts = relationship("VerificationAttempt", back_populates="case", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="case", cascade="all, delete-orphan")
    handover = relationship("HandoverRecord", back_populates="case", uselist=False)


class VerificationQuestion(Base):
    __tablename__ = "verification_questions"

    id = Column(String(64), primary_key=True, index=True)
    case_id = Column(String(64), ForeignKey("verification_cases.id", ondelete="CASCADE"), nullable=False, index=True)
    question = Column(Text, nullable=False)
    
    # Salted/hashed or protected expected answer for deterministic match
    expected_answer_normalized = Column(Text, nullable=False)
    provided_answer = Column(Text, nullable=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    case = relationship("VerificationCase", back_populates="questions")


class VerificationAttempt(Base):
    __tablename__ = "verification_attempts"

    id = Column(String(64), primary_key=True, index=True)
    case_id = Column(String(64), ForeignKey("verification_cases.id", ondelete="CASCADE"), nullable=False, index=True)
    answers_json = Column(Text, nullable=False)
    is_success = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
    ip_address = Column(String(64), nullable=True)
    attempt_timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    case = relationship("VerificationCase", back_populates="attempts")
