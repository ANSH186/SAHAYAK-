import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from app.db.models.notification import Notification, NotificationType
from app.repositories.notifications import NotificationRepository


class NotificationService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = NotificationRepository(db)

    def send_notification(
        self,
        user_id: str,
        title: str,
        body: str,
        notif_type: str = NotificationType.SYSTEM.value,
        related_case_id: Optional[str] = None,
        link_url: Optional[str] = None
    ) -> Notification:
        notif = Notification(
            id=f"notif_{uuid.uuid4().hex[:10]}",
            user_id=user_id,
            type=notif_type,
            title=title,
            body=body,
            related_case_id=related_case_id,
            link_url=link_url,
            read=False
        )
        return self.repo.create(notif)

    def get_user_notifications(self, user_id: str) -> List[Notification]:
        return self.repo.get_by_user_id(user_id)

    def mark_read(self, notif_id: str, user_id: str) -> bool:
        return self.repo.mark_as_read(notif_id, user_id)

    def mark_all_read(self, user_id: str) -> int:
        return self.repo.mark_all_as_read(user_id)
