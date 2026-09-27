from typing import Dict, Set
from fastapi import HTTPException, status
from app.db.models.report import ReportStatus


VALID_TRANSITIONS: Dict[str, Set[str]] = {
    ReportStatus.SUBMITTED.value: {
        ReportStatus.ACTIVE.value,
        ReportStatus.MATCH_SUGGESTED.value,
        ReportStatus.MATCHED.value,
        ReportStatus.RETURNED.value,
        ReportStatus.SAFELY_RETURNED.value,
        ReportStatus.CLOSED.value,
        ReportStatus.PAUSED.value
    },
    ReportStatus.ACTIVE.value: {
        ReportStatus.MATCH_SUGGESTED.value,
        ReportStatus.MATCHED.value,
        ReportStatus.VERIFICATION_PENDING.value,
        ReportStatus.RETURNED.value,
        ReportStatus.PAUSED.value,
        ReportStatus.CLOSED.value
    },
    ReportStatus.MATCH_SUGGESTED.value: {
        ReportStatus.ACTIVE.value,
        ReportStatus.MATCHED.value,
        ReportStatus.VERIFICATION_PENDING.value,
        ReportStatus.RETURNED.value,
        ReportStatus.SAFELY_RETURNED.value,
        ReportStatus.CLOSED.value
    },
    ReportStatus.MATCHED.value: {
        ReportStatus.ACTIVE.value,
        ReportStatus.VERIFICATION_PENDING.value,
        ReportStatus.UNDER_REVIEW.value,
        ReportStatus.RETURNED.value,
        ReportStatus.SAFELY_RETURNED.value,
        ReportStatus.CLOSED.value
    },
    ReportStatus.VERIFICATION_PENDING.value: {
        ReportStatus.VERIFIED.value,
        ReportStatus.MANUAL_REVIEW.value,
        ReportStatus.UNDER_REVIEW.value,
        ReportStatus.RETURNED.value,
        ReportStatus.SAFELY_RETURNED.value,
        ReportStatus.ACTIVE.value,
        ReportStatus.CLOSED.value
    },
    ReportStatus.UNDER_REVIEW.value: {
        ReportStatus.VERIFIED.value,
        ReportStatus.MANUAL_REVIEW.value,
        ReportStatus.RETURNED.value,
        ReportStatus.SAFELY_RETURNED.value,
        ReportStatus.ACTIVE.value,
        ReportStatus.CLOSED.value
    },
    ReportStatus.MANUAL_REVIEW.value: {
        ReportStatus.VERIFIED.value,
        ReportStatus.RETURNED.value,
        ReportStatus.SAFELY_RETURNED.value,
        ReportStatus.ACTIVE.value,
        ReportStatus.CLOSED.value
    },
    ReportStatus.VERIFIED.value: {
        ReportStatus.HANDOVER_PENDING.value,
        ReportStatus.HANDOVER_SCHEDULED.value,
        ReportStatus.HANDOVER_CONFIRMED.value,
        ReportStatus.RETURNED.value,
        ReportStatus.SAFELY_RETURNED.value,
        ReportStatus.CLOSED.value
    },
    ReportStatus.HANDOVER_PENDING.value: {
        ReportStatus.HANDOVER_SCHEDULED.value,
        ReportStatus.HANDOVER_CONFIRMED.value,
        ReportStatus.RETURNED.value,
        ReportStatus.SAFELY_RETURNED.value,
        ReportStatus.CLOSED.value
    },
    ReportStatus.HANDOVER_SCHEDULED.value: {
        ReportStatus.HANDOVER_CONFIRMED.value,
        ReportStatus.RETURNED.value,
        ReportStatus.SAFELY_RETURNED.value,
        ReportStatus.CLOSED.value
    },
    ReportStatus.HANDOVER_CONFIRMED.value: {
        ReportStatus.RETURNED.value,
        ReportStatus.SAFELY_RETURNED.value,
        ReportStatus.CLOSED.value
    },
    ReportStatus.RETURNED.value: {
        ReportStatus.SAFELY_RETURNED.value,
        ReportStatus.CLOSED.value,
        ReportStatus.ACTIVE.value
    },
    ReportStatus.SAFELY_RETURNED.value: {
        ReportStatus.CLOSED.value,
        ReportStatus.ACTIVE.value
    },
    ReportStatus.PAUSED.value: {
        ReportStatus.ACTIVE.value,
        ReportStatus.CLOSED.value
    },
    ReportStatus.CLOSED.value: {
        ReportStatus.ACTIVE.value
    }
}


def validate_status_transition(current_status: str, new_status: str) -> bool:
    if current_status == new_status:
        return True
    allowed = VALID_TRANSITIONS.get(current_status, set())
    if new_status not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status transition from '{current_status}' to '{new_status}'. Allowed transitions: {list(allowed)}"
        )
    return True
