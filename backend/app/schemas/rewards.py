from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class RewardTransactionResponse(BaseModel):
    id: str
    userId: str
    caseId: Optional[str] = None
    points: int
    reason: str
    badgeAwarded: Optional[str] = None
    date: str


class MilestoneResponse(BaseModel):
    id: str
    title: str
    badgeCode: str
    description: Optional[str] = None
    certificateNumber: Optional[str] = None
    achievedAt: Optional[str] = None


class CertificateResponse(BaseModel):
    certificateId: str
    recipientName: str
    usn: str
    department: str
    awardTitle: str
    pointsEarned: int
    recoveriesCompleted: int
    issueDate: str
    signatory: str = "Dean of Student Affairs, The National Institute of Engineering, Mysuru"
    verificationHash: str


class LeaderboardEntryResponse(BaseModel):
    rank: int
    studentId: str
    studentName: str
    usn: str
    points: int
    recoveriesCount: int
    streakDays: int
    department: str
    avatar: Optional[str] = None
    isCurrentUser: bool = False
