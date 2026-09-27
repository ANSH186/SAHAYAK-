from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models.user import User
from app.core.permissions import get_current_user
from app.repositories.verification import VerificationRepository
from app.api.v1.routes.verification import format_case_dict
from app.utils.formatters import api_response

router = APIRouter(prefix="/recovery", tags=["Recovery"])


@router.get("/{case_id}", summary="Get recovery lifecycle case summary")
def get_recovery_case(case_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    repo = VerificationRepository(db)
    case = repo.get_by_id(case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recovery case '{case_id}' not found."
        )

    # Authorization
    if current_user.id not in [case.claimant_id, case.finder_id] and current_user.role not in ["admin", "proctor", "authorized_reviewer"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to view this recovery case."
        )

    return api_response(format_case_dict(case))
