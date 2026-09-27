from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class NotificationResponse(BaseModel):
    id: str
    userId: str
    type: str
    title: str
    message: str
    linkUrl: Optional[str] = None
    link: Optional[str] = None
    read: bool = False
    isRead: bool = False
    needsAction: bool = False
    timestamp: str
