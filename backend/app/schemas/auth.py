import re
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator


class StudentRegistrationRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str
    usn: str
    phone: Optional[str] = None
    branch: Optional[str] = "Computer Science & Engineering"
    semester: Optional[int] = 5
    section: Optional[str] = "A"
    academic_year: Optional[str] = "2024-2025"
    emergency_contact: Optional[str] = None
    privacy_shield_active: Optional[bool] = True

    @field_validator("email")
    @classmethod
    def validate_nie_email(cls, v: str) -> str:
        v_clean = str(v).lower().strip()
        if not v_clean.endswith("@nie.ac.in"):
            raise ValueError("Institutional restriction: Only official NIE student emails ending in '@nie.ac.in' are permitted.")
        return v_clean

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter (A-Z).")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter (a-z).")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one numerical digit (0-9).")
        if not re.search(r"[@$!%*?&#^()_+\-=\[\]{}|;:,.<>?/~`]", v):
            raise ValueError("Password must contain at least one special symbol (e.g. @, #, $, %, !, &).")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AdminLoginRequest(BaseModel):
    email: EmailStr
    password: str
    admin_access_code: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: dict
