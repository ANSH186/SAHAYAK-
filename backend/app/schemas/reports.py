from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class ItemImageSchema(BaseModel):
    id: str
    url: str
    source_type: Optional[str] = "USER_UPLOADED"
    is_primary: Optional[bool] = False
    is_reference: Optional[bool] = False
    created_at: Optional[datetime] = None


class ReportCreate(BaseModel):
    report_type: str = Field(..., description="LOST or FOUND")
    title: str = Field(..., min_length=2, max_length=255)
    category: str
    description: str
    incident_place: str = Field(..., description="Where lost or found")
    current_location: Optional[str] = Field(None, description="Where currently stored")
    place_id: Optional[str] = None
    event_date: Optional[str] = None
    event_time: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    color: Optional[str] = None
    material: Optional[str] = None
    size: Optional[str] = None
    distinguishing_marks: Optional[str] = None
    serial_number: Optional[str] = None
    secret_verification_clue: Optional[str] = Field(None, description="Protected clue for ownership verification")
    is_anonymous: Optional[bool] = False
    image_urls: Optional[List[str]] = []


class ReportUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    incident_place: Optional[str] = None
    current_location: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    color: Optional[str] = None
    distinguishing_marks: Optional[str] = None
    status: Optional[str] = None


class StatusTransitionRequest(BaseModel):
    new_status: str
    notes: Optional[str] = None


class ReportResponse(BaseModel):
    id: str
    report_type: str
    type: Optional[str] = None  # Frontend alias
    title: str
    category: str
    description: str
    incident_place: str
    incidentPlace: Optional[str] = None  # Frontend alias
    current_location: Optional[str] = None
    currentLocation: Optional[str] = None  # Frontend alias
    event_date: Optional[str] = None
    incidentDate: Optional[str] = None  # Frontend alias
    event_time: Optional[str] = None
    incidentTime: Optional[str] = None  # Frontend alias
    brand: Optional[str] = None
    model: Optional[str] = None
    color: Optional[str] = None
    material: Optional[str] = None
    size: Optional[str] = None
    distinguishing_marks: Optional[str] = None
    distinguishingFeatures: Optional[str] = None  # Frontend alias
    status: str
    reward_points_eligible: int = 50
    rewardPointsEligible: Optional[int] = 50  # Frontend alias
    is_anonymous: bool = False
    isAnonymous: Optional[bool] = False  # Frontend alias
    reporter_id: str
    reporterId: Optional[str] = None  # Frontend alias
    reporter_name: Optional[str] = None
    reporterName: Optional[str] = None  # Frontend alias
    reporter_usn: Optional[str] = None
    reporterUSN: Optional[str] = None  # Frontend alias
    created_at: Optional[datetime] = None
    createdAt: Optional[str] = None  # Frontend alias
    updated_at: Optional[datetime] = None
    updatedAt: Optional[str] = None  # Frontend alias
    images: List[ItemImageSchema] = []
