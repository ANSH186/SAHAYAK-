from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.db.models.report import ItemReport
from app.db.models.image import ItemImage


class ReportRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, report_id: str) -> Optional[ItemReport]:
        return self.db.query(ItemReport).filter(ItemReport.id == report_id).first()

    def get_all(
        self,
        report_type: Optional[str] = None,
        category: Optional[str] = None,
        status: Optional[str] = None,
        search: Optional[str] = None,
        reporter_id: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[ItemReport]:
        query = self.db.query(ItemReport)
        
        if report_type:
            query = query.filter(ItemReport.report_type == report_type.upper())
        if category:
            query = query.filter(ItemReport.category == category)
        if status:
            query = query.filter(ItemReport.status == status.upper())
        if reporter_id:
            query = query.filter(ItemReport.reporter_id == reporter_id)
        if search:
            s = f"%{search}%"
            query = query.filter(
                or_(
                    ItemReport.title.ilike(s),
                    ItemReport.description.ilike(s),
                    ItemReport.incident_place.ilike(s),
                    ItemReport.category.ilike(s),
                    ItemReport.brand.ilike(s),
                    ItemReport.color.ilike(s)
                )
            )
        
        return query.order_by(ItemReport.created_at.desc()).offset(offset).limit(limit).all()

    def create(self, report: ItemReport) -> ItemReport:
        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)
        return report

    def update(self, report: ItemReport) -> ItemReport:
        self.db.commit()
        self.db.refresh(report)
        return report

    def delete(self, report: ItemReport) -> bool:
        self.db.delete(report)
        self.db.commit()
        return True

    def add_image(self, image: ItemImage) -> ItemImage:
        self.db.add(image)
        self.db.commit()
        self.db.refresh(image)
        return image
