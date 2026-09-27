from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.db.models.match import PotentialMatch


class MatchRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, match_id: str) -> Optional[PotentialMatch]:
        return self.db.query(PotentialMatch).filter(PotentialMatch.id == match_id).first()

    def get_by_reports(self, lost_id: str, found_id: str) -> Optional[PotentialMatch]:
        return (
            self.db.query(PotentialMatch)
            .filter(
                PotentialMatch.lost_report_id == lost_id,
                PotentialMatch.found_report_id == found_id
            )
            .first()
        )

    def get_all(
        self,
        report_id: Optional[str] = None,
        min_score: float = 0.0,
        status: Optional[str] = None,
        limit: int = 50
    ) -> List[PotentialMatch]:
        query = self.db.query(PotentialMatch)
        if report_id:
            query = query.filter(
                or_(
                    PotentialMatch.lost_report_id == report_id,
                    PotentialMatch.found_report_id == report_id
                )
            )
        if min_score > 0.0:
            query = query.filter(PotentialMatch.similarity_score >= min_score)
        if status:
            query = query.filter(PotentialMatch.status == status)

        return query.order_by(PotentialMatch.similarity_score.desc()).limit(limit).all()

    def create(self, match: PotentialMatch) -> PotentialMatch:
        self.db.add(match)
        self.db.commit()
        self.db.refresh(match)
        return match

    def update(self, match: PotentialMatch) -> PotentialMatch:
        self.db.commit()
        self.db.refresh(match)
        return match
