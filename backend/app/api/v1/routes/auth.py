from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models.user import User
from app.schemas.auth import StudentRegistrationRequest, LoginRequest, AdminLoginRequest, TokenResponse
from app.schemas.users import UserResponse
from app.services.auth_service import AuthService
from app.core.permissions import get_current_user
from app.utils.formatters import api_response

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", summary="Register a new student account")
def register(req: StudentRegistrationRequest, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    user, token = auth_service.register_student(req)
    
    user_data = {
        "id": user.id,
        "email": user.email,
        "role": user.role,
        "fullName": user.full_name,
        "name": user.full_name,
        "usn": user.student_profile.usn if user.student_profile else "",
        "department": user.student_profile.branch if user.student_profile else "",
        "branch": user.student_profile.branch if user.student_profile else "",
        "semester": user.student_profile.semester if user.student_profile else 5,
        "section": user.student_profile.section if user.student_profile else "A",
        "avatar": user.avatar_url,
        "points": user.student_profile.points_balance if user.student_profile else 0,
        "badgeLevel": user.student_profile.badge_level if user.student_profile else "Campus Guardian Lv. 1"
    }

    return api_response({
        "access_token": token,
        "token_type": "bearer",
        "user": user_data
    })


@router.post("/login", summary="Student login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    user, token = auth_service.authenticate_student(req)
    
    user_data = {
        "id": user.id,
        "email": user.email,
        "role": user.role,
        "fullName": user.full_name,
        "name": user.full_name,
        "usn": user.student_profile.usn if user.student_profile else "",
        "department": user.student_profile.branch if user.student_profile else "",
        "branch": user.student_profile.branch if user.student_profile else "",
        "semester": user.student_profile.semester if user.student_profile else 5,
        "section": user.student_profile.section if user.student_profile else "A",
        "avatar": user.avatar_url,
        "points": user.student_profile.points_balance if user.student_profile else 0,
        "badgeLevel": user.student_profile.badge_level if user.student_profile else "Campus Guardian Lv. 1"
    }

    return api_response({
        "access_token": token,
        "token_type": "bearer",
        "user": user_data
    })


@router.post("/admin/login", summary="Proctor and Admin portal login")
def admin_login(req: AdminLoginRequest, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    user, token = auth_service.authenticate_admin(req)

    user_data = {
        "id": user.id,
        "email": user.email,
        "role": user.role,
        "fullName": user.full_name,
        "name": user.full_name,
        "designation": "Chief Proctor / Student Affairs Desk",
        "permissions": ["all", "reports:read", "reports:write", "verify:override", "rewards:audit"]
    }

    return api_response({
        "access_token": token,
        "token_type": "bearer",
        "user": user_data
    })


@router.get("/me", summary="Get currently authenticated user details")
def get_me(current_user: User = Depends(get_current_user)):
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
        "finderPoints": current_user.student_profile.points_balance if current_user.student_profile else 0,
        "recoveredCount": current_user.student_profile.recovered_count if current_user.student_profile else 0,
        "streakDays": current_user.student_profile.streak_days if current_user.student_profile else 0,
        "badgeLevel": current_user.student_profile.badge_level if current_user.student_profile else "Campus Guardian Lv. 1",
        "privacyShieldActive": current_user.student_profile.privacy_shield_active if current_user.student_profile else True
    }
    return api_response(user_data)
