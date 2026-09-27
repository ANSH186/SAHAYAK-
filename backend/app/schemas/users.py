from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr


class StudentProfileSchema(BaseModel):
    usn: str
    college_email: Optional[str] = None
    campus: str = "NIE North Campus"
    branch: str = "Computer Science & Engineering"
    semester: int = 5
    section: str = "A"
    academic_year: str = "2024-2025"
    emergency_contact: Optional[str] = None
    privacy_shield_active: bool = True
    points_balance: int = 0
    recovered_count: int = 0
    streak_days: int = 0
    badge_level: str = "Campus Guardian Lv. 1"


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    role: str
    status: str
    full_name: str
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: Optional[datetime] = None
    student_profile: Optional[StudentProfileSchema] = None


class UserProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    branch: Optional[str] = None
    semester: Optional[int] = None
    section: Optional[str] = None
    emergency_contact: Optional[str] = None
    privacy_shield_active: Optional[bool] = None
