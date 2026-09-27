from datetime import datetime, timezone
import enum
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.session import Base


class MatchStatus(str, enum.Enum):
    PENDING_REVIEW = "PENDING_REVIEW"
    VERIFICATION_REQUESTED = "VERIFICATION_REQUESTED"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"
    INCONCLUSIVE = "INCONCLUSIVE"


class PotentialMatch(Base):
    __tablename__ = "potential_matches"

    id = Column(String(64), primary_key=True, index=True)
    lost_report_id = Column(String(64), ForeignKey("item_reports.id", ondelete="CASCADE"), nullable=False, index=True)
    found_report_id = Column(String(64), ForeignKey("item_reports.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Combined Similarity Score (0.0 to 1.0)
    similarity_score = Column(Float, nullable=False, default=0.0)
    
    # Breakdown Signals
    visual_score = Column(Float, default=0.0)
    text_score = Column(Float, default=0.0)
    location_score = Column(Float, default=0.0)
    time_score = Column(Float, default=0.0)
    category_score = Column(Float, default=0.0)
    attribute_score = Column(Float, default=0.0)
    
    # Explanations & Clues (JSON encoded list of strings)
    reasons_json = Column(Text, default="[]")
    match_clues_json = Column(Text, default="[]")

    status = Column(String(32), default=MatchStatus.PENDING_REVIEW.value, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    lost_report = relationship("ItemReport", foreign_keys=[lost_report_id])
    found_report = relationship("ItemReport", foreign_keys=[found_report_id])
