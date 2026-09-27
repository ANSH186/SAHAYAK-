from datetime import datetime, timezone
import enum
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.session import Base


class HandoverMethod(str, enum.Enum):
    NIE_LOST_AND_FOUND_OFFICE = "NIE_LOST_AND_FOUND_OFFICE"
    CAMPUS_SECURITY_MAIN_GATE = "CAMPUS_SECURITY_MAIN_GATE"
    DEPARTMENT_ADMIN_DESK = "DEPARTMENT_ADMIN_DESK"
    DIRECT_AUTHORIZED_STUDENT_HANDOVER = "DIRECT_AUTHORIZED_STUDENT_HANDOVER"


class HandoverStatus(str, enum.Enum):
    SCHEDULED = "SCHEDULED"
    CHECKED_IN = "CHECKED_IN"
    HANDOVER_CONFIRMED = "HANDOVER_CONFIRMED"
    COMPLETED = "COMPLETED"
    MISSED = "MISSED"


class HandoverRecord(Base):
    __tablename__ = "handover_records"

    id = Column(String(64), primary_key=True, index=True)
    case_id = Column(String(64), ForeignKey("verification_cases.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    method = Column(String(64), default=HandoverMethod.NIE_LOST_AND_FOUND_OFFICE.value)
    location_name = Column(String(255), nullable=False)
    scheduled_date = Column(String(32), nullable=True)
    scheduled_time_window = Column(String(64), nullable=True)
    
    otp_code = Column(String(16), nullable=True)
    qr_verification_code = Column(String(64), nullable=True)
    
    is_finder_confirmed = Column(Boolean, default=False)
    finder_confirmed_at = Column(DateTime, nullable=True)
    
    is_claimant_confirmed = Column(Boolean, default=False)
    claimant_confirmed_at = Column(DateTime, nullable=True)
    
    is_staff_witnessed = Column(Boolean, default=False)
    witnessing_staff_id = Column(String(64), nullable=True)
    
    status = Column(String(32), default=HandoverStatus.SCHEDULED.value, index=True)
    notes = Column(Text, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    case = relationship("VerificationCase", back_populates="handover")
