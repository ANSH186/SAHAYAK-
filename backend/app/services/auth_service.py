import uuid
from typing import Dict, Any, Tuple
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password, create_access_token
from app.db.models.user import User, StudentProfile, UserRole, UserStatus
from app.repositories.users import UserRepository
from app.schemas.auth import StudentRegistrationRequest, LoginRequest, AdminLoginRequest
from app.services.audit_service import AuditService


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)
        self.audit_service = AuditService(db)

    def register_student(self, req: StudentRegistrationRequest) -> Tuple[User, str]:
        # Check email uniqueness
        existing_email = self.user_repo.get_by_email(req.email)
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email address already exists."
            )

        # Check USN uniqueness
        existing_usn = self.user_repo.get_by_usn(req.usn)
        if existing_usn:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A student profile with this USN already exists."
            )

        user_id = f"std_{uuid.uuid4().hex[:8]}"
        user = User(
            id=user_id,
            email=req.email.lower().strip(),
            password_hash=hash_password(req.password),
            role=UserRole.STUDENT.value,
            status=UserStatus.ACTIVE.value,
            full_name=req.full_name.strip(),
            phone=req.phone,
            avatar_url=f"https://api.dicebear.com/7.x/avataaars/svg?seed={req.usn}"
        )
        self.user_repo.create_user(user)

        profile = StudentProfile(
            user_id=user_id,
            usn=req.usn.upper().strip(),
            college_email=req.email.lower().strip(),
            campus="NIE North Campus",
            branch=req.branch or "Computer Science & Engineering",
            semester=req.semester or 5,
            section=req.section or "A",
            academic_year=req.academic_year or "2024-2025",
            emergency_contact=req.emergency_contact,
            privacy_shield_active=req.privacy_shield_active if req.privacy_shield_active is not None else True,
            points_balance=0,
            recovered_count=0
        )
        self.user_repo.create_student_profile(profile)

        token = create_access_token(user.id, role=user.role)

        self.audit_service.log(
            event_type="USER_REGISTERED",
            description=f"Student registration completed for USN: {req.usn}",
            actor_id=user.id,
            actor_name=user.full_name,
            actor_role=user.role
        )

        return user, token

    def authenticate_student(self, req: LoginRequest) -> Tuple[User, str]:
        user = self.user_repo.get_by_email(req.email)
        if not user or not verify_password(req.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password."
            )

        if user.status != UserStatus.ACTIVE.value:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account is not active. Please contact NIE Student Affairs."
            )

        token = create_access_token(user.id, role=user.role)

        self.audit_service.log(
            event_type="USER_LOGIN",
            description=f"Student login: {user.email}",
            actor_id=user.id,
            actor_name=user.full_name,
            actor_role=user.role
        )

        return user, token

    def authenticate_admin(self, req: AdminLoginRequest) -> Tuple[User, str]:
        user = self.user_repo.get_by_email(req.email)
        if not user or not verify_password(req.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid administrator credentials."
            )

        if user.role not in [UserRole.ADMIN.value, UserRole.PROCTOR.value, UserRole.AUTHORIZED_REVIEWER.value, "proctor", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account does not possess proctor or administrator privileges."
            )

        token = create_access_token(user.id, role=user.role)

        self.audit_service.log(
            event_type="ADMIN_LOGIN",
            description=f"Proctor/Admin portal login: {user.email}",
            actor_id=user.id,
            actor_name=user.full_name,
            actor_role=user.role
        )

        return user, token
