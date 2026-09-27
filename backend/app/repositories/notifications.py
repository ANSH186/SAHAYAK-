from typing import List, Optional
from sqlalchemy.orm import Session
from app.db.models.notification import Notification


class NotificationRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user_id(self, user_id: str, limit: int = 50) -> List[Notification]:
        return (
            self.db.query(Notification)
            .filter(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
            .limit(limit)
            .all()
        )

    def create(self, notif: Notification) -> Notification:
        self.db.add(notif)
        self.db.commit()
        self.db.refresh(notif)
        return notif

    def mark_as_read(self, notif_id: str, user_id: str) -> bool:
        notif = self.db.query(Notification).filter(Notification.id == notif_id, Notification.user_id == user_id).first()
        if notif:
            notif.read = True
            self.db.commit()
            return True
        return False

    def mark_all_as_read(self, user_id: str) -> int:
        count = self.db.query(Notification).filter(Notification.user_id == user_id, Notification.read == False).update({"read": True})
        self.db.commit()
        return count
