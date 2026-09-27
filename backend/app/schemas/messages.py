from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class MessageSendRequest(BaseModel):
    case_id: str
    content: str


class MessageResponse(BaseModel):
    id: str
    caseId: str
    senderId: str
    senderName: str
    senderRole: str
    content: str
    timestamp: str
    read: bool = False
    isSystemMessage: bool = False
