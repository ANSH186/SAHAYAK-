import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.db.models.handover import HandoverRecord, HandoverStatus, HandoverMethod
from app.db.models.report import ItemReport, ReportStatus
from app.db.models.verification import VerificationCase, VerificationStatus
from app.db.models.user import User
from app.db.models.notification import NotificationType
from app.repositories.verification import VerificationRepository
from app.repositories.reports import ReportRepository
from app.schemas.handover import HandoverScheduleRequest, HandoverConfirmRequest
from app.services.audit_service import AuditService
from app.services.reward_service import RewardService
from app.services.notification_service import NotificationService


class HandoverService:
    def __init__(self, db: Session):
        self.db = db
        self.case_repo = VerificationRepository(db)
        self.report_repo = ReportRepository(db)
        self.audit_service = AuditService(db)
        self.reward_service = RewardService(db)
        self.notif_service = NotificationService(db)

    def schedule_handover(self, req: HandoverScheduleRequest, actor: User) -> HandoverRecord:
        case = self.case_repo.get_by_id(req.case_id)
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Case not found."
            )

        if actor.id not in [case.claimant_id, case.finder_id] and actor.role not in ["admin", "proctor", "staff"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to schedule handover for this case."
            )

        existing = self.case_repo.get_handover_by_case(req.case_id)
        if existing:
            existing.method = req.method
            existing.location_name = req.location_name
            existing.scheduled_date = req.scheduled_date
            existing.scheduled_time_window = req.scheduled_time_window
            existing.notes = req.notes
            existing.status = HandoverStatus.SCHEDULED.value
            saved = self.case_repo.create_or_update_handover(existing)
        else:
            record = HandoverRecord(
                id=f"hnd_{uuid.uuid4().hex[:8]}",
                case_id=req.case_id,
                method=req.method,
                location_name=req.location_name,
                scheduled_date=req.scheduled_date or datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                scheduled_time_window=req.scheduled_time_window or "10:00 AM - 12:00 PM",
                otp_code=case.handover_otp or f"{uuid.uuid4().hex[:6].upper()}",
                qr_verification_code=f"QR-{case.id.upper()}",
                status=HandoverStatus.SCHEDULED.value,
                notes=req.notes
            )
            saved = self.case_repo.create_or_update_handover(record)

        # Update reports status
        lost_rep = self.report_repo.get_by_id(case.lost_report_id)
        if lost_rep:
            lost_rep.status = ReportStatus.HANDOVER_SCHEDULED.value
            self.report_repo.update(lost_rep)

        found_rep = self.report_repo.get_by_id(case.found_report_id)
        if found_rep:
            found_rep.status = ReportStatus.HANDOVER_SCHEDULED.value
            self.report_repo.update(found_rep)

        self.audit_service.log(
            event_type="HANDOVER_SCHEDULED",
            description=f"Handover scheduled at {saved.location_name} for case {case.id}",
            actor_id=actor.id,
            actor_name=actor.full_name,
            case_id=case.id
        )

        return saved

    def confirm_handover(self, req: HandoverConfirmRequest, actor: User) -> HandoverRecord:
        case = self.case_repo.get_by_id(req.case_id)
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Case not found."
            )

        handover = self.case_repo.get_handover_by_case(req.case_id)
        if not handover:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Handover has not been scheduled yet."
            )

        now = datetime.now(timezone.utc)

        if req.action_type == "FINDER_CONFIRM":
            # Finder deposited item or handed over physically
            handover.is_finder_confirmed = True
            handover.finder_confirmed_at = now
            handover.status = HandoverStatus.HANDOVER_CONFIRMED.value

            found_rep = self.report_repo.get_by_id(case.found_report_id)
            if found_rep:
                found_rep.status = ReportStatus.HANDOVER_CONFIRMED.value
                found_rep.current_location = handover.location_name
                self.report_repo.update(found_rep)

            self.notif_service.send_notification(
                user_id=case.claimant_id,
                title="Item Deposited / Ready for Collection",
                body=f"The finder confirmed item handover at {handover.location_name}. Please collect and confirm return.",
                notif_type=NotificationType.HANDOVER.value,
                related_case_id=case.id,
                link_url=f"/student/recovery/{case.id}"
            )

        elif req.action_type == "RECIPIENT_RETURN_CONFIRM":
            # Recipient confirms receipt of item
            if req.otp_code and handover.otp_code and req.otp_code.strip() != handover.otp_code.strip():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid handover verification OTP."
                )

            handover.is_claimant_confirmed = True
            handover.claimant_confirmed_at = now
            handover.status = HandoverStatus.COMPLETED.value
            handover.completed_at = now

            # Transition reports to RETURNED / SAFELY_RETURNED
            lost_rep = self.report_repo.get_by_id(case.lost_report_id)
            if lost_rep:
                lost_rep.status = ReportStatus.RETURNED.value
                self.report_repo.update(lost_rep)

            found_rep = self.report_repo.get_by_id(case.found_report_id)
            if found_rep:
                found_rep.status = ReportStatus.SAFELY_RETURNED.value
                self.report_repo.update(found_rep)

            # Award finder reward points
            if case.finder_id:
                self.reward_service.award_recovery_points(
                    finder_id=case.finder_id,
                    case_id=case.id,
                    item_title=lost_rep.title if lost_rep else "Lost Item"
                )

            self.notif_service.send_notification(
                user_id=case.claimant_id,
                title="Item Safely Returned!",
                body="Your lost item recovery lifecycle is complete. Thank you for using SAHAYAK!",
                notif_type=NotificationType.RETURNED.value,
                related_case_id=case.id,
                link_url=f"/student/recovery/{case.id}"
            )

        saved = self.case_repo.create_or_update_handover(handover)

        self.audit_service.log(
            event_type="HANDOVER_STATUS_UPDATE",
            description=f"Handover {req.action_type} for case {case.id} - Status: {saved.status}",
            actor_id=actor.id,
            actor_name=actor.full_name,
            case_id=case.id
        )

        return saved
