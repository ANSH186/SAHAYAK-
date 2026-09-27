from datetime import datetime, timezone
import enum
from sqlalchemy import Column, String, Boolean, Integer, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from app.db.session import Base


class UserRole(str, enum.Enum):
    STUDENT = "student"
    ADMIN = "admin"
    PROCTOR = "proctor"
    AUTHORIZED_REVIEWER = "authorized_reviewer"
    STAFF = "staff"


class UserStatus(str, enum.Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    PENDING_VERIFICATION = "pending_verification"


class User(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(32), default=UserRole.STUDENT.value, index=True)
    status = Column(String(32), default=UserStatus.ACTIVE.value)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(32), nullable=True)
    avatar_url = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    student_profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    reports = relationship("ItemReport", back_populates="reporter", foreign_keys="[ItemReport.reporter_id]")
    reward_transactions = relationship("RewardTransaction", back_populates="user")
    notifications = relationship("Notification", back_populates="user")


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    usn = Column(String(32), unique=True, index=True, nullable=False)
    college_email = Column(String(255), nullable=True)
    campus = Column(String(100), default="NIE North Campus")
    branch = Column(String(64), default="Computer Science & Engineering")
    semester = Column(Integer, default=5)
    section = Column(String(8), default="A")
    academic_year = Column(String(32), default="2024-2025")
    emergency_contact = Column(String(32), nullable=True)
    privacy_shield_active = Column(Boolean, default=True)
    points_balance = Column(Integer, default=0)
    recovered_count = Column(Integer, default=0)
    streak_days = Column(Integer, default=0)
    badge_level = Column(String(64), default="Campus Guardian Lv. 1")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="student_profile")
