from typing import List, Optional
from sqlalchemy.orm import Session
from app.db.models.user import User, StudentProfile


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: str) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email.lower().strip()).first()

    def get_by_usn(self, usn: str) -> Optional[StudentProfile]:
        return self.db.query(StudentProfile).filter(StudentProfile.usn == usn.upper().strip()).first()

    def create_user(self, user: User) -> User:
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def create_student_profile(self, profile: StudentProfile) -> StudentProfile:
        self.db.add(profile)
        self.db.commit()
        self.db.refresh(profile)
        return profile

    def update_user(self, user: User) -> User:
        self.db.commit()
        self.db.refresh(user)
        return user

    def get_top_students(self, limit: int = 20) -> List[StudentProfile]:
        return (
            self.db.query(StudentProfile)
            .join(User, StudentProfile.user_id == User.id)
            .order_by(StudentProfile.points_balance.desc(), StudentProfile.recovered_count.desc())
            .limit(limit)
            .all()
        )
