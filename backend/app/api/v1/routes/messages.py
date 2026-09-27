from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models.user import User
from app.core.permissions import get_current_user
from app.schemas.messages import MessageSendRequest
from app.services.messaging_service import MessagingService
from app.utils.formatters import api_response

router = APIRouter(prefix="/messages", tags=["Messages"])


@router.get("/{case_id}", summary="Get messages for a recovery case")
def get_case_messages(case_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    svc = MessagingService(db)
    messages = svc.get_case_messages(case_id, current_user)
    data = [
        {
            "id": m.id,
            "caseId": m.case_id,
            "senderId": m.sender_id,
            "senderName": m.sender_name,
            "senderRole": m.sender_role,
            "content": m.content,
            "text": m.content,
            "timestamp": m.timestamp.isoformat() if m.timestamp else None,
            "read": m.read,
            "isSystemMessage": m.is_system_message
        }
        for m in messages
    ]
    return api_response(data)


@router.post("", summary="Send a message in a recovery case conversation")
def send_message(req: MessageSendRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    svc = MessagingService(db)
    msg = svc.send_message(req.case_id, req.content, current_user)
    return api_response({
        "id": msg.id,
        "caseId": msg.case_id,
        "senderId": msg.sender_id,
        "senderName": msg.sender_name,
        "senderRole": msg.sender_role,
        "content": msg.content,
        "timestamp": msg.timestamp.isoformat() if msg.timestamp else None,
        "read": msg.read,
        "isSystemMessage": msg.is_system_message
    })
