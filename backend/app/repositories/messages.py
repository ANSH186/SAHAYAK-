from typing import List, Optional
from sqlalchemy.orm import Session
from app.db.models.message import Message


class MessageRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_case_id(self, case_id: str) -> List[Message]:
        return (
            self.db.query(Message)
            .filter(Message.case_id == case_id)
            .order_by(Message.timestamp.asc())
            .all()
        )

    def create(self, message: Message) -> Message:
        self.db.add(message)
        self.db.commit()
        self.db.refresh(message)
        return message

    def mark_as_read(self, case_id: str, recipient_id: str):
        self.db.query(Message).filter(
            Message.case_id == case_id,
            Message.sender_id != recipient_id,
            Message.read == False
        ).update({"read": True})
        self.db.commit()
