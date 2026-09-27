from typing import List, Optional
from sqlalchemy.orm import Session
from app.db.models.reward import RewardTransaction, Milestone
from app.db.models.user import StudentProfile


class RewardRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_user_transactions(self, user_id: str) -> List[RewardTransaction]:
        return (
            self.db.query(RewardTransaction)
            .filter(RewardTransaction.user_id == user_id)
            .order_by(RewardTransaction.created_at.desc())
            .all()
        )

    def get_all_transactions(self, limit: int = 100) -> List[RewardTransaction]:
        return (
            self.db.query(RewardTransaction)
            .order_by(RewardTransaction.created_at.desc())
            .limit(limit)
            .all()
        )

    def add_transaction(self, tx: RewardTransaction) -> RewardTransaction:
        self.db.add(tx)
        
        # Update user's points balance and recovery count
        profile = self.db.query(StudentProfile).filter(StudentProfile.user_id == tx.user_id).first()
        if profile:
            profile.points_balance += tx.points
            if tx.points > 0:
                profile.recovered_count += 1
                if profile.points_balance >= 500:
                    profile.badge_level = "Campus Guardian Veteran (Master)"
                elif profile.points_balance >= 250:
                    profile.badge_level = "Campus Guardian Lv. 3 (Silver)"
                elif profile.points_balance >= 100:
                    profile.badge_level = "Campus Guardian Lv. 2 (Bronze)"

        self.db.commit()
        self.db.refresh(tx)
        return tx

    def get_user_milestones(self, user_id: str) -> List[Milestone]:
        return self.db.query(Milestone).filter(Milestone.user_id == user_id).all()

    def add_milestone(self, milestone: Milestone) -> Milestone:
        self.db.add(milestone)
        self.db.commit()
        self.db.refresh(milestone)
        return milestone
