from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class VerificationQuestionPublic(BaseModel):
    id: str
    question: str
    is_verified: bool = False


class VerificationSubmissionRequest(BaseModel):
    case_id: str
    answers: List[str]  # Claimant responses to the questions


class VerificationCaseResponse(BaseModel):
    id: str
    matchId: Optional[str] = None
    reportId: Optional[str] = None
    lostReportId: str
    foundReportId: str
    claimantId: str
    claimantName: Optional[str] = None
    claimantUSN: Optional[str] = None
    status: str
    confidenceRating: str
    attemptsCount: int = 0
    maxAttempts: int = 3
    manualReviewNotes: Optional[str] = None
    assignedStaff: Optional[str] = None
    handoverOtp: Optional[str] = None
    handoverLocation: Optional[str] = None
    questions: List[VerificationQuestionPublic] = []
    createdAt: Optional[str] = None
    created_at: Optional[datetime] = None


class ManualReviewActionRequest(BaseModel):
    decision: str  # APPROVE, REJECT, REQUEST_MORE_INFO
    staff_notes: str
    assigned_staff: Optional[str] = None
