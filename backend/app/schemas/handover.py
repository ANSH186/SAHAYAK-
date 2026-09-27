from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class HandoverScheduleRequest(BaseModel):
    case_id: str
    method: str = "NIE_LOST_AND_FOUND_OFFICE"
    location_name: str = "NIE Lost & Found Central Office (Admin Block Ground Floor)"
    scheduled_date: Optional[str] = None
    scheduled_time_window: Optional[str] = "10:00 AM - 12:00 PM"
    notes: Optional[str] = None


class HandoverConfirmRequest(BaseModel):
    case_id: str
    otp_code: Optional[str] = None
    action_type: str = "FINDER_CONFIRM"  # FINDER_CONFIRM or RECIPIENT_RETURN_CONFIRM


class HandoverResponse(BaseModel):
    id: str
    caseId: str
    method: str
    locationName: str
    scheduledDate: Optional[str] = None
    scheduledTimeWindow: Optional[str] = None
    otpCode: Optional[str] = None
    qrVerificationCode: Optional[str] = None
    isFinderConfirmed: bool = False
    isClaimantConfirmed: bool = False
    isStaffWitnessed: bool = False
    status: str
    completedAt: Optional[str] = None
