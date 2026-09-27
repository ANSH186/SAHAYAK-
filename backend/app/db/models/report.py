from datetime import datetime, timezone
import enum
from sqlalchemy import Column, String, Boolean, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.session import Base


class ReportType(str, enum.Enum):
    LOST = "LOST"
    FOUND = "FOUND"


class ReportStatus(str, enum.Enum):
    SUBMITTED = "SUBMITTED"
    ACTIVE = "ACTIVE"
    MATCH_SUGGESTED = "MATCH_SUGGESTED"
    MATCHED = "MATCHED"
    VERIFICATION_PENDING = "VERIFICATION_PENDING"
    UNDER_REVIEW = "UNDER_REVIEW"
    MANUAL_REVIEW = "MANUAL_REVIEW"
    VERIFIED = "VERIFIED"
    HANDOVER_PENDING = "HANDOVER_PENDING"
    HANDOVER_SCHEDULED = "HANDOVER_SCHEDULED"
    HANDOVER_CONFIRMED = "HANDOVER_CONFIRMED"
    RETURNED = "RETURNED"
    SAFELY_RETURNED = "SAFELY_RETURNED"
    CLOSED = "CLOSED"
    PAUSED = "PAUSED"


class ItemReport(Base):
    __tablename__ = "item_reports"

    id = Column(String(64), primary_key=True, index=True)
    report_type = Column(String(16), nullable=False, index=True)  # LOST or FOUND
    title = Column(String(255), nullable=False, index=True)
    category = Column(String(64), nullable=False, index=True)
    description = Column(Text, nullable=False)
    
    # Location model separation
    incident_place = Column(String(255), nullable=False)  # Where lost / found (e.g. Sir MV Block - 2nd Floor)
    current_location = Column(String(255), nullable=True)  # Current storage place (e.g. Security Desk Locker #3)
    place_id = Column(String(64), ForeignKey("campus_locations.id", ondelete="SET NULL"), nullable=True)
    
    # Date & Time of Incident
    event_date = Column(String(32), nullable=True)
    event_time = Column(String(32), nullable=True)

    # Structured item attributes
    brand = Column(String(100), nullable=True)
    model = Column(String(100), nullable=True)
    color = Column(String(64), nullable=True)
    material = Column(String(64), nullable=True)
    size = Column(String(64), nullable=True)
    distinguishing_marks = Column(Text, nullable=True)
    serial_number = Column(String(100), nullable=True)
    
    # Anti-Fraud & Unique Verification Tracking
    tracking_number = Column(String(64), nullable=True, index=True)
    anti_fraud_code = Column(String(32), nullable=True, index=True)
    secret_verification_clue = Column(Text, nullable=True)
    
    # Status & Workflow
    status = Column(String(32), default=ReportStatus.SUBMITTED.value, index=True)
    reward_points_eligible = Column(Integer, default=50)
    is_anonymous = Column(Boolean, default=False)
    
    # Reporter metadata
    reporter_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    reporter_name = Column(String(255), nullable=True)
    reporter_usn = Column(String(32), nullable=True)

    # Embeddings (Stored as JSON serializable text representation for portability)
    text_embedding = Column(Text, nullable=True)
    image_embedding = Column(Text, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    reporter = relationship("User", back_populates="reports", foreign_keys=[reporter_id])
    images = relationship("ItemImage", back_populates="report", cascade="all, delete-orphan")
    location = relationship("CampusLocation", foreign_keys=[place_id])
