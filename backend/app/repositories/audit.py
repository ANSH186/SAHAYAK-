from typing import List, Optional
from sqlalchemy.orm import Session
from app.db.models.audit import AuditLog


class AuditRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, limit: int = 100, offset: int = 0) -> List[AuditLog]:
        return (
            self.db.query(AuditLog)
            .order_by(AuditLog.timestamp.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )

    def log(self, log_entry: AuditLog) -> AuditLog:
        self.db.add(log_entry)
        self.db.commit()
        self.db.refresh(log_entry)
        return log_entry
