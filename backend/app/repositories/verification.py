from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.db.models.verification import VerificationCase, VerificationQuestion, VerificationAttempt
from app.db.models.handover import HandoverRecord


class VerificationRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, case_id: str) -> Optional[VerificationCase]:
        return self.db.query(VerificationCase).filter(VerificationCase.id == case_id).first()

    def get_by_match_id(self, match_id: str) -> Optional[VerificationCase]:
        return self.db.query(VerificationCase).filter(VerificationCase.match_id == match_id).first()

    def get_by_user_id(self, user_id: str) -> List[VerificationCase]:
        return (
            self.db.query(VerificationCase)
            .filter(
                or_(
                    VerificationCase.claimant_id == user_id,
                    VerificationCase.finder_id == user_id
                )
            )
            .order_by(VerificationCase.created_at.desc())
            .all()
        )

    def get_all(self, status: Optional[str] = None, limit: int = 100) -> List[VerificationCase]:
        query = self.db.query(VerificationCase)
        if status:
            query = query.filter(VerificationCase.status == status)
        return query.order_by(VerificationCase.created_at.desc()).limit(limit).all()

    def create_case(self, case: VerificationCase) -> VerificationCase:
        self.db.add(case)
        self.db.commit()
        self.db.refresh(case)
        return case

    def update_case(self, case: VerificationCase) -> VerificationCase:
        self.db.commit()
        self.db.refresh(case)
        return case

    def add_attempt(self, attempt: VerificationAttempt) -> VerificationAttempt:
        self.db.add(attempt)
        self.db.commit()
        self.db.refresh(attempt)
        return attempt

    def get_handover_by_case(self, case_id: str) -> Optional[HandoverRecord]:
        return self.db.query(HandoverRecord).filter(HandoverRecord.case_id == case_id).first()

    def create_or_update_handover(self, handover: HandoverRecord) -> HandoverRecord:
        self.db.add(handover)
        self.db.commit()
        self.db.refresh(handover)
        return handover
