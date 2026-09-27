import uuid
from datetime import datetime, timezone
from typing import List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.db.models.message import Message
from app.db.models.user import User
from app.repositories.messages import MessageRepository
from app.repositories.verification import VerificationRepository
from app.services.audit_service import AuditService


class MessagingService:
    def __init__(self, db: Session):
        self.db = db
        self.msg_repo = MessageRepository(db)
        self.case_repo = VerificationRepository(db)
        self.audit_service = AuditService(db)

    def get_case_messages(self, case_id: str, current_user: User) -> List[Message]:
        case = self.case_repo.get_by_id(case_id)
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Case not found."
            )

        # Authorization: Claimant, Finder, or Staff/Admin
        if current_user.id not in [case.claimant_id, case.finder_id] and current_user.role not in ["admin", "proctor", "staff"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to view messages for this case."
            )

        self.msg_repo.mark_as_read(case_id, current_user.id)
        return self.msg_repo.get_by_case_id(case_id)

    def send_message(self, case_id: str, content: str, sender: User) -> Message:
        case = self.case_repo.get_by_id(case_id)
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Case not found."
            )

        if sender.id not in [case.claimant_id, case.finder_id] and sender.role not in ["admin", "proctor", "staff"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not a participant in this recovery conversation."
            )

        msg = Message(
            id=f"msg_{uuid.uuid4().hex[:10]}",
            case_id=case_id,
            sender_id=sender.id,
            sender_name=sender.full_name,
            sender_role=sender.role,
            content=content.strip(),
            read=False,
            is_system_message=False,
            timestamp=datetime.now(timezone.utc)
        )

        return self.msg_repo.create(msg)
