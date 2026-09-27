import json
import random
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Tuple
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models.verification import VerificationCase, VerificationQuestion, VerificationAttempt, VerificationStatus
from app.db.models.report import ItemReport, ReportStatus
from app.db.models.user import User
from app.db.models.notification import NotificationType
from app.integrations.ai import get_ai_provider
from app.repositories.verification import VerificationRepository
from app.repositories.reports import ReportRepository
from app.repositories.matches import MatchRepository
from app.services.audit_service import AuditService
from app.services.notification_service import NotificationService
from app.services.reward_service import RewardService


class VerificationService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = VerificationRepository(db)
        self.report_repo = ReportRepository(db)
        self.match_repo = MatchRepository(db)
        self.ai_provider = get_ai_provider()
        self.audit_service = AuditService(db)
        self.notif_service = NotificationService(db)
        self.reward_service = RewardService(db)

    def initiate_verification(self, match_id: str, claimant: User) -> VerificationCase:
        match = self.match_repo.get_by_id(match_id)
        if not match:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Match record not found."
            )

        existing = self.repo.get_by_match_id(match_id)
        if existing:
            return existing

        lost_rep = self.report_repo.get_by_id(match.lost_report_id)
        found_rep = self.report_repo.get_by_id(match.found_report_id)

        case_id = f"case_{uuid.uuid4().hex[:8]}"

        # Derive protected clue from found report or lost report
        clue = found_rep.secret_verification_clue or lost_rep.secret_verification_clue or found_rep.distinguishing_marks or "black casing"
        
        # Generate questions via AI abstraction
        generated_q = self.ai_provider.generate_verification_questions(clue, found_rep.category)

        case = VerificationCase(
            id=case_id,
            match_id=match_id,
            lost_report_id=lost_rep.id,
            found_report_id=found_rep.id,
            claimant_id=claimant.id,
            finder_id=found_rep.reporter_id,
            status=VerificationStatus.AWAITING_CLAIMANT.value,
            confidence_rating="Moderate",
            attempts_count=0,
            max_attempts=settings.MAX_VERIFICATION_ATTEMPTS
        )
        self.repo.create_case(case)

        # Attach generated question records with protected expected answer
        for q_item in generated_q:
            q_obj = VerificationQuestion(
                id=f"q_{uuid.uuid4().hex[:8]}",
                case_id=case_id,
                question=q_item["question"],
                expected_answer_normalized=q_item["expected_answer_normalized"].lower().strip(),
                is_verified=False
            )
            self.db.add(q_obj)
        self.db.commit()
        self.db.refresh(case)

        self.audit_service.log(
            event_type="VERIFICATION_INITIATED",
            description=f"Claimant {claimant.full_name} initiated verification for match {match_id}",
            actor_id=claimant.id,
            actor_name=claimant.full_name,
            case_id=case_id
        )

        return case

    def submit_answers(self, case_id: str, answers: List[str], claimant: User) -> VerificationCase:
        case = self.repo.get_by_id(case_id)
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Verification case not found."
            )

        if case.claimant_id != claimant.id and claimant.role not in ["admin", "proctor"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to submit answers for this claim."
            )

        # Prevent brute-force guessing past attempt limit
        if case.attempts_count >= case.max_attempts:
            case.status = VerificationStatus.MANUAL_STAFF_REVIEW.value
            case.manual_review_notes = "Max verification attempts exceeded. Routed to Campus Proctor."
            self.repo.update_case(case)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Maximum verification attempts exceeded. Your claim has been routed to the Proctor Desk for manual review."
            )

        case.attempts_count += 1

        # Deterministic verification of answers against expected normalized clue
        questions = case.questions
        verified_count = 0

        for i, q in enumerate(questions):
            claimant_answer = (answers[i] if i < len(answers) else "").lower().strip()
            q.provided_answer = claimant_answer
            expected = q.expected_answer_normalized.lower().strip()

            # Deterministic token matching
            expected_tokens = set(expected.split())
            answer_tokens = set(claimant_answer.split())

            if expected in claimant_answer or claimant_answer in expected or (expected_tokens and expected_tokens.issubset(answer_tokens)):
                q.is_verified = True
                verified_count += 1
            else:
                q.is_verified = False

        is_success = (verified_count == len(questions))

        # Record attempt
        attempt = VerificationAttempt(
            id=f"att_{uuid.uuid4().hex[:8]}",
            case_id=case.id,
            answers_json=json.dumps(answers),
            is_success=is_success,
            notes=f"{verified_count}/{len(questions)} verified"
        )
        self.repo.add_attempt(attempt)

        if is_success:
            case.status = VerificationStatus.OWNERSHIP_CONFIRMED.value
            case.confidence_rating = "High"
            # Generate 6-digit secure handover OTP
            case.handover_otp = f"{random.randint(100000, 999999)}"
            case.handover_location = "NIE Lost & Found Central Office (Admin Block Ground Floor)"

            # Update reports to VERIFIED / HANDOVER_PENDING
            lost_rep = self.report_repo.get_by_id(case.lost_report_id)
            if lost_rep:
                lost_rep.status = ReportStatus.VERIFIED.value
                self.report_repo.update(lost_rep)

            found_rep = self.report_repo.get_by_id(case.found_report_id)
            if found_rep:
                found_rep.status = ReportStatus.HANDOVER_PENDING.value
                self.report_repo.update(found_rep)

            # Award finder Good Samaritan reward points
            if case.finder_id:
                try:
                    self.reward_service.award_recovery_points(
                        finder_id=case.finder_id,
                        case_id=case.id,
                        item_title=lost_rep.title if lost_rep else "Found Item"
                    )
                except Exception as e:
                    pass

            # Notify finder and claimant
            if case.finder_id:
                self.notif_service.send_notification(
                    user_id=case.finder_id,
                    title="Ownership Verified & +75 Points Awarded!",
                    body="The claimant provided the correct verification details. You earned +75 Good Samaritan points!",
                    notif_type=NotificationType.VERIFICATION.value,
                    related_case_id=case.id,
                    link_url=f"/student/recovery/{case.id}"
                )

            self.notif_service.send_notification(
                user_id=claimant.id,
                title="Ownership Confirmed!",
                body=f"Your verification was successful. Handover OTP: {case.handover_otp}.",
                notif_type=NotificationType.VERIFICATION.value,
                related_case_id=case.id,
                link_url=f"/student/recovery/{case.id}"
            )
        else:
            if case.attempts_count >= case.max_attempts:
                case.status = VerificationStatus.MANUAL_STAFF_REVIEW.value
                case.confidence_rating = "Inconclusive"
                case.manual_review_notes = "Automated answers failed. Awaiting proctor review."
            else:
                case.status = VerificationStatus.UNDER_REVIEW.value

        self.repo.update_case(case)

        self.audit_service.log(
            event_type="VERIFICATION_ATTEMPT",
            description=f"Attempt #{case.attempts_count} for case {case.id} - Result: {case.status}",
            actor_id=claimant.id,
            actor_name=claimant.full_name,
            case_id=case.id,
            status="SUCCESS" if is_success else "WARNING"
        )

        return case

    def manual_staff_review(self, case_id: str, decision: str, staff_notes: str, staff: User) -> VerificationCase:
        case = self.repo.get_by_id(case_id)
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Case not found."
            )

        case.assigned_staff = staff.full_name
        case.manual_review_notes = staff_notes

        if decision == "APPROVE":
            case.status = VerificationStatus.OWNERSHIP_CONFIRMED.value
            case.confidence_rating = "High (Proctor Verified)"
            case.handover_otp = f"{random.randint(100000, 999999)}"
            case.handover_location = "NIE Lost & Found Central Office (Admin Block Ground Floor)"

            # Update reports to VERIFIED / HANDOVER_PENDING
            lost_rep = self.report_repo.get_by_id(case.lost_report_id)
            if lost_rep:
                lost_rep.status = ReportStatus.VERIFIED.value
                self.report_repo.update(lost_rep)

            found_rep = self.report_repo.get_by_id(case.found_report_id)
            if found_rep:
                found_rep.status = ReportStatus.HANDOVER_PENDING.value
                self.report_repo.update(found_rep)

            # Award finder Good Samaritan reward points
            if case.finder_id:
                try:
                    self.reward_service.award_recovery_points(
                        finder_id=case.finder_id,
                        case_id=case.id,
                        item_title=lost_rep.title if lost_rep else "Found Item"
                    )
                except Exception as e:
                    pass

            # Notify finder and claimant
            if case.finder_id:
                self.notif_service.send_notification(
                    user_id=case.finder_id,
                    title="Ownership Verified & +75 Points Awarded!",
                    body="The Proctor verified the claim! You earned +75 Good Samaritan points for returning this item.",
                    notif_type=NotificationType.VERIFICATION.value,
                    related_case_id=case.id,
                    link_url=f"/student/recovery/{case.id}"
                )

            if case.claimant_id:
                self.notif_service.send_notification(
                    user_id=case.claimant_id,
                    title="Ownership Confirmed by Proctor!",
                    body=f"Your claim has been approved by the Campus Proctor. Single-use Handover OTP: {case.handover_otp}.",
                    notif_type=NotificationType.VERIFICATION.value,
                    related_case_id=case.id,
                    link_url=f"/student/recovery/{case.id}"
                )
        else:
            case.status = VerificationStatus.CLAIM_DENIED.value
            case.confidence_rating = "Flagged"

        self.repo.update_case(case)

        self.audit_service.log(
            event_type="MANUAL_REVIEW",
            description=f"Proctor {staff.full_name} manually reviewed case {case.id}: {decision}",
            actor_id=staff.id,
            actor_name=staff.full_name,
            actor_role=staff.role,
            case_id=case.id
        )

        return case

