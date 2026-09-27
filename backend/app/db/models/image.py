from datetime import datetime, timezone
import enum
from sqlalchemy import Column, String, Boolean, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.session import Base


class ImageSource(str, enum.Enum):
    USER_CAPTURED = "USER_CAPTURED"
    USER_UPLOADED = "USER_UPLOADED"
    REFERENCE_IMAGE = "REFERENCE_IMAGE"
    UNKNOWN = "UNKNOWN"


class ItemImage(Base):
    __tablename__ = "item_images"

    id = Column(String(64), primary_key=True, index=True)
    report_id = Column(String(64), ForeignKey("item_reports.id", ondelete="CASCADE"), nullable=False, index=True)
    storage_path = Column(Text, nullable=False)
    url = Column(Text, nullable=False)
    source_type = Column(String(32), default=ImageSource.USER_UPLOADED.value)
    mime_type = Column(String(64), default="image/jpeg")
    file_size = Column(Integer, default=0)
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    is_primary = Column(Boolean, default=False)
    is_reference = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    report = relationship("ItemReport", back_populates="images")
