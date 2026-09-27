from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class LocationCreate(BaseModel):
    id: Optional[str] = None
    name: str
    campus: Optional[str] = "NIE North Campus"
    zone: Optional[str] = "Academic Zone"
    building: Optional[str] = None
    floor: Optional[str] = None
    room: Optional[str] = None
    latitude: float
    longitude: float
    location_type: Optional[str] = "ACADEMIC_BLOCK"
    has_collection_desk: Optional[bool] = False
    geometry_geojson: Optional[str] = None


class LocationResponse(BaseModel):
    id: str
    name: str
    campus: str
    zone: str
    building: Optional[str] = None
    floor: Optional[str] = None
    room: Optional[str] = None
    latitude: float
    longitude: float
    location_type: str
    has_collection_desk: bool
    item_count: int = 0
    geometry_geojson: Optional[str] = None
