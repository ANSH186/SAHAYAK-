from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Boolean, Integer, DateTime, Text
from app.db.session import Base


class CampusLocation(Base):
    __tablename__ = "campus_locations"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    campus = Column(String(100), default="NIE North Campus")
    zone = Column(String(64), default="Academic Zone")
    building = Column(String(100), nullable=True)
    floor = Column(String(64), nullable=True)
    room = Column(String(64), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location_type = Column(String(64), default="ACADEMIC_BLOCK")
    has_collection_desk = Column(Boolean, default=False)
    item_count = Column(Integer, default=0)
    geometry_geojson = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
