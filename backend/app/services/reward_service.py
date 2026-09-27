import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional
from sqlalchemy.orm import Session

from app.db.models.reward import RewardTransaction, Milestone
from app.db.models.user import User, StudentProfile
from app.db.models.notification import NotificationType
from app.repositories.rewards import RewardRepository
from app.repositories.users import UserRepository
from app.services.audit_service import AuditService
from app.services.notification_service import NotificationService


class RewardService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = RewardRepository(db)
        self.user_repo = UserRepository(db)
        self.audit_service = AuditService(db)
        self.notif_service = NotificationService(db)

    def award_recovery_points(self, finder_id: str, case_id: str, item_title: str) -> RewardTransaction:
        points = 75
        reason = f"Verified return & handover of {item_title}"

        tx = RewardTransaction(
            id=f"tx_{uuid.uuid4().hex[:8]}",
            user_id=finder_id,
            case_id=case_id,
            points=points,
            reason=reason,
            badge_awarded="Good Samaritan"
        )
        saved_tx = self.repo.add_transaction(tx)

        # Check milestones
        finder_profile = self.user_repo.get_by_id(finder_id)
        if finder_profile and finder_profile.student_profile:
            p = finder_profile.student_profile
            # Milestone 1: First Return
            if p.recovered_count == 1:
                cert_num = f"NIE-LF-2026-{uuid.uuid4().hex[:6].upper()}"
                milestone = Milestone(
                    id=f"ms_{uuid.uuid4().hex[:8]}",
                    user_id=finder_id,
                    title="First Successful Campus Recovery Certificate",
                    badge_code="GUARDIAN_INITIATE",
                    description="Official recognition for honest item return at NIE Mysore.",
                    certificate_number=cert_num
                )
                self.repo.add_milestone(milestone)

        self.notif_service.send_notification(
            user_id=finder_id,
            title="Reward Points Awarded!",
            body=f"You earned +{points} Campus Guardian points for safely returning {item_title}!",
            notif_type=NotificationType.REWARD.value,
            related_case_id=case_id,
            link_url="/student/rewards"
        )

        self.audit_service.log(
            event_type="REWARD_AWARDED",
            description=f"Awarded {points} pts to student {finder_id} for case {case_id}",
            actor_id="SYSTEM",
            actor_name="SAHAYAK Reward Engine",
            case_id=case_id
        )

        return saved_tx

    def get_user_transactions(self, user_id: str) -> List[RewardTransaction]:
        return self.repo.get_user_transactions(user_id)

    def get_user_milestones(self, user_id: str) -> List[Milestone]:
        return self.repo.get_user_milestones(user_id)

    def get_leaderboard(self, current_user_id: Optional[str] = None) -> List[Dict]:
        top_profiles = self.user_repo.get_top_students(limit=50)
        leaderboard = []

        for rank, p in enumerate(top_profiles, start=1):
            user = p.user
            dept = p.branch or "Computer Science & Engineering"
            name = user.full_name if user else "Student"
            avatar = user.avatar_url if user and user.avatar_url else f"https://api.dicebear.com/7.x/avataaars/svg?seed={p.usn or name}"

            leaderboard.append({
                "rank": rank,
                "studentId": p.user_id,
                "studentName": name,
                "name": name,
                "fullName": name,
                "usn": p.usn,
                "points": p.points_balance,
                "recoveredCount": p.recovered_count,
                "recoveriesCount": p.recovered_count,
                "streakDays": p.streak_days,
                "department": dept,
                "branch": dept,
                "avatar": avatar,
                "badgeLevel": p.badge_level,
                "isCurrentUser": (p.user_id == current_user_id) if current_user_id else False
            })

        return leaderboard
