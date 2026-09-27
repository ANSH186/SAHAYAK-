from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models.user import User
from app.core.permissions import get_current_user, get_optional_current_user
from app.services.reward_service import RewardService
from app.utils.formatters import api_response

router = APIRouter(prefix="/rewards", tags=["Rewards"])


@router.get("/balance", summary="Get user points balance and badges")
def get_balance(current_user: User = Depends(get_current_user)):
    profile = current_user.student_profile
    return api_response({
        "userId": current_user.id,
        "points": profile.points_balance if profile else 0,
        "recoveredCount": profile.recovered_count if profile else 0,
        "streakDays": profile.streak_days if profile else 0,
        "badgeLevel": profile.badge_level if profile else "Campus Guardian Lv. 1"
    })


@router.get("/transactions", summary="List user reward points transactions")
def get_transactions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    svc = RewardService(db)
    txs = svc.get_user_transactions(current_user.id)
    data = [
        {
            "id": t.id,
            "userId": t.user_id,
            "caseId": t.case_id,
            "points": t.points,
            "reason": t.reason,
            "badgeAwarded": t.badge_awarded,
            "date": t.created_at.strftime("%b %d, %Y") if t.created_at else "Recently",
            "timestamp": t.created_at.isoformat() if t.created_at else None
        }
        for t in txs
    ]
    return api_response(data)


@router.get("/milestones", summary="Get student milestones and certificates")
def get_milestones(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    svc = RewardService(db)
    ms = svc.get_user_milestones(current_user.id)
    data = [
        {
            "id": m.id,
            "title": m.title,
            "badgeCode": m.badge_code,
            "description": m.description,
            "certificateNumber": m.certificate_number,
            "achievedAt": m.achieved_at.strftime("%b %d, %Y") if m.achieved_at else None
        }
        for m in ms
    ]
    return api_response(data)


@router.get("/leaderboard", summary="Campus Leaderboard")
def get_leaderboard(current_user: Optional[User] = Depends(get_optional_current_user), db: Session = Depends(get_db)):
    svc = RewardService(db)
    uid = current_user.id if current_user else None
    leaderboard = svc.get_leaderboard(current_user_id=uid)
    return api_response(leaderboard)


@router.get("/certificate/{cert_id}", summary="Get verifiable certificate details")
def get_certificate(cert_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = current_user.student_profile
    return api_response({
        "certificateId": cert_id,
        "recipientName": current_user.full_name,
        "usn": profile.usn if profile else "4NI21CS089",
        "department": profile.branch if profile else "Computer Science & Engineering",
        "awardTitle": "NIE Campus Guardian of Honesty & Integrity",
        "pointsEarned": profile.points_balance if profile else 150,
        "recoveriesCompleted": profile.recovered_count if profile else 2,
        "issueDate": "September 2026",
        "signatory": "Dean of Student Affairs, The National Institute of Engineering, Mysuru",
        "verificationHash": f"SHA256-{cert_id.upper()}"
    })
