from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models.user import User
from app.db.models.verification import VerificationCase
from app.core.permissions import get_current_user, get_current_admin
from app.schemas.verification import VerificationSubmissionRequest, ManualReviewActionRequest
from app.services.verification_service import VerificationService
from app.repositories.verification import VerificationRepository
from app.utils.formatters import api_response

router = APIRouter(prefix="/verification", tags=["Verification"])


def format_case_dict(c: VerificationCase) -> dict:
    questions = []
    if c.questions:
        for q in c.questions:
            questions.append({
                "id": q.id,
                "question": q.question,
                "isVerified": q.is_verified,
                # Expected answers are strictly omitted for security!
            })

    return {
        "id": c.id,
        "matchId": c.match_id,
        "lostReportId": c.lost_report_id,
        "foundReportId": c.found_report_id,
        "claimantId": c.claimant_id,
        "claimantName": c.claimant.full_name if c.claimant else "Student Claimant",
        "claimantUSN": c.claimant.student_profile.usn if (c.claimant and c.claimant.student_profile) else "Protected",
        "finderId": c.finder_id,
        "finderName": c.finder.full_name if c.finder else "Finder",
        "status": c.status,
        "confidenceRating": c.confidence_rating,
        "attemptsCount": c.attempts_count,
        "maxAttempts": c.max_attempts,
        "manualReviewNotes": c.manual_review_notes,
        "assignedStaff": c.assigned_staff,
        "handoverOtp": c.handover_otp,
        "handoverLocation": c.handover_location,
        "questions": questions,
        "createdAt": c.created_at.isoformat() if c.created_at else None
    }


@router.get("/cases", summary="List verification cases")
def list_cases(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    repo = VerificationRepository(db)
    if current_user.role in ["admin", "proctor", "authorized_reviewer"]:
        cases = repo.get_all(limit=100)
    else:
        cases = repo.get_by_user_id(current_user.id)
    return api_response([format_case_dict(c) for c in cases])


@router.get("/cases/{case_id}", summary="Get verification case details")
def get_case(case_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    repo = VerificationRepository(db)
    case = repo.get_by_id(case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Verification case '{case_id}' not found."
        )

    # Authorization
    if current_user.id not in [case.claimant_id, case.finder_id] and current_user.role not in ["admin", "proctor", "authorized_reviewer"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to view this verification case."
        )

    return api_response(format_case_dict(case))


@router.post("/initiate", summary="Initiate ownership verification for a match")
def initiate_verification(
    match_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    svc = VerificationService(db)
    case = svc.initiate_verification(match_id, current_user)
    return api_response(format_case_dict(case))


@router.post("/cases/{case_id}/answers", summary="Submit claimant verification answers")
def submit_answers(
    case_id: str,
    req: VerificationSubmissionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    svc = VerificationService(db)
    case = svc.submit_answers(case_id, req.answers, current_user)
    return api_response(format_case_dict(case))


@router.post("/cases/{case_id}/manual-review", summary="Proctor / staff manual review decision")
def manual_review(
    case_id: str,
    req: ManualReviewActionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    svc = VerificationService(db)
    case = svc.manual_staff_review(case_id, req.decision, req.staff_notes, current_user)
    return api_response(format_case_dict(case))

