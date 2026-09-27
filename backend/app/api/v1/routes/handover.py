from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models.user import User
from app.core.permissions import get_current_user
from app.schemas.handover import HandoverScheduleRequest, HandoverConfirmRequest
from app.services.handover_service import HandoverService
from app.repositories.verification import VerificationRepository
from app.utils.formatters import api_response

router = APIRouter(prefix="/handover", tags=["Handover"])


@router.get("/{case_id}", summary="Get handover details for a case")
def get_handover(case_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    repo = VerificationRepository(db)
    handover = repo.get_handover_by_case(case_id)
    if not handover:
        return api_response(None)
    return api_response({
        "id": handover.id,
        "caseId": handover.case_id,
        "method": handover.method,
        "locationName": handover.location_name,
        "scheduledDate": handover.scheduled_date,
        "scheduledTimeWindow": handover.scheduled_time_window,
        "otpCode": handover.otp_code,
        "qrVerificationCode": handover.qr_verification_code,
        "isFinderConfirmed": handover.is_finder_confirmed,
        "isClaimantConfirmed": handover.is_claimant_confirmed,
        "isStaffWitnessed": handover.is_staff_witnessed,
        "status": handover.status,
        "completedAt": handover.completed_at.isoformat() if handover.completed_at else None
    })


@router.post("/schedule", summary="Schedule item handover date, time, and campus location")
def schedule_handover(req: HandoverScheduleRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    svc = HandoverService(db)
    record = svc.schedule_handover(req, current_user)
    return api_response({
        "id": record.id,
        "caseId": record.case_id,
        "method": record.method,
        "locationName": record.location_name,
        "scheduledDate": record.scheduled_date,
        "scheduledTimeWindow": record.scheduled_time_window,
        "otpCode": record.otp_code,
        "status": record.status
    })


@router.post("/confirm", summary="Confirm physical handover (finder handover or claimant return)")
def confirm_handover(req: HandoverConfirmRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    svc = HandoverService(db)
    record = svc.confirm_handover(req, current_user)
    return api_response({
        "id": record.id,
        "caseId": record.case_id,
        "status": record.status,
        "isFinderConfirmed": record.is_finder_confirmed,
        "isClaimantConfirmed": record.is_claimant_confirmed,
        "completedAt": record.completed_at.isoformat() if record.completed_at else None
    })
