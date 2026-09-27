from typing import Optional
from sqlalchemy.orm import Session
from app.db.models.user import User, StudentProfile
from app.repositories.users import UserRepository
from app.schemas.users import UserProfileUpdateRequest


class UserService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = UserRepository(db)

    def get_user_profile(self, user_id: str) -> Optional[User]:
        return self.repo.get_by_id(user_id)

    def update_user_profile(self, user_id: str, req: UserProfileUpdateRequest) -> User:
        user = self.repo.get_by_id(user_id)
        if not user:
            return None

        if req.full_name is not None:
            user.full_name = req.full_name
        if req.phone is not None:
            user.phone = req.phone
        if req.avatar_url is not None:
            user.avatar_url = req.avatar_url

        if user.student_profile:
            profile = user.student_profile
            if req.branch is not None:
                profile.branch = req.branch
            if req.semester is not None:
                profile.semester = req.semester
            if req.section is not None:
                profile.section = req.section
            if req.emergency_contact is not None:
                profile.emergency_contact = req.emergency_contact
            if req.privacy_shield_active is not None:
                profile.privacy_shield_active = req.privacy_shield_active

        return self.repo.update_user(user)
