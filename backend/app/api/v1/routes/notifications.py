from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models.user import User
from app.core.permissions import get_current_user
from app.services.notification_service import NotificationService
from app.utils.formatters import api_response

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", summary="Get current user notifications")
def list_notifications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    svc = NotificationService(db)
    notifications = svc.get_user_notifications(current_user.id)
    data = [
        {
            "id": n.id,
            "userId": n.user_id,
            "type": n.type,
            "title": n.title,
            "message": n.body,
            "linkUrl": n.link_url,
            "link": n.link_url,
            "read": n.read,
            "isRead": n.read,
            "needsAction": "VERIFICATION" in n.type or "HANDOVER" in n.type,
            "timestamp": n.created_at.isoformat() if n.created_at else None
        }
        for n in notifications
    ]
    return api_response(data)


@router.patch("/{notif_id}/read", summary="Mark single notification as read")
def mark_read(notif_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    svc = NotificationService(db)
    success = svc.mark_read(notif_id, current_user.id)
    return api_response({"success": success})


@router.post("/read-all", summary="Mark all user notifications as read")
def mark_all_read(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    svc = NotificationService(db)
    count = svc.mark_all_read(current_user.id)
    return api_response({"markedCount": count})
