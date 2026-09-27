from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models.user import User
from app.core.permissions import get_current_user
from app.schemas.users import UserProfileUpdateRequest
from app.services.user_service import UserService
from app.utils.formatters import api_response

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/profile", summary="Get user profile")
def get_profile(current_user: User = Depends(get_current_user)):
    user_data = {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role,
        "fullName": current_user.full_name,
        "name": current_user.full_name,
        "phone": current_user.phone,
        "avatar": current_user.avatar_url,
        "usn": current_user.student_profile.usn if current_user.student_profile else "",
        "department": current_user.student_profile.branch if current_user.student_profile else "",
        "branch": current_user.student_profile.branch if current_user.student_profile else "",
        "semester": current_user.student_profile.semester if current_user.student_profile else 5,
        "section": current_user.student_profile.section if current_user.student_profile else "A",
        "academicYear": current_user.student_profile.academic_year if current_user.student_profile else "2024-2025",
        "points": current_user.student_profile.points_balance if current_user.student_profile else 0,
        "badgeLevel": current_user.student_profile.badge_level if current_user.student_profile else "Campus Guardian Lv. 1",
        "privacyShieldActive": current_user.student_profile.privacy_shield_active if current_user.student_profile else True
    }
    return api_response(user_data)


@router.patch("/profile", summary="Update user profile settings")
def update_profile(req: UserProfileUpdateRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    svc = UserService(db)
    updated_user = svc.update_user_profile(current_user.id, req)
    
    user_data = {
        "id": updated_user.id,
        "email": updated_user.email,
        "role": updated_user.role,
        "fullName": updated_user.full_name,
        "name": updated_user.full_name,
        "phone": updated_user.phone,
        "avatar": updated_user.avatar_url,
        "usn": updated_user.student_profile.usn if updated_user.student_profile else "",
        "department": updated_user.student_profile.branch if updated_user.student_profile else "",
        "branch": updated_user.student_profile.branch if updated_user.student_profile else "",
        "semester": updated_user.student_profile.semester if updated_user.student_profile else 5,
        "section": updated_user.student_profile.section if updated_user.student_profile else "A",
        "academicYear": updated_user.student_profile.academic_year if updated_user.student_profile else "2024-2025",
        "emergencyContact": updated_user.student_profile.emergency_contact if updated_user.student_profile else "",
        "points": updated_user.student_profile.points_balance if updated_user.student_profile else 0,
        "badgeLevel": updated_user.student_profile.badge_level if updated_user.student_profile else "Campus Guardian Lv. 1",
        "privacyShieldActive": updated_user.student_profile.privacy_shield_active if updated_user.student_profile else True
    }
    return api_response(user_data)
