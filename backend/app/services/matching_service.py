import os
import re
import json
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple, Set, Any
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.logging import logger
from app.db.models.report import ItemReport, ReportType, ReportStatus
from app.db.models.match import PotentialMatch, MatchStatus
from app.db.models.notification import NotificationType
from app.db.models.verification import VerificationCase, VerificationStatus
from app.db.models.message import Message
from app.integrations.embedding import cosine_similarity
from app.repositories.matches import MatchRepository
from app.repositories.reports import ReportRepository
from app.repositories.verification import VerificationRepository
from app.repositories.messages import MessageRepository
from app.services.notification_service import NotificationService
from app.services.audit_service import AuditService
from app.vision.services.pipeline import get_vision_pipeline
from app.vision.services.matcher import get_matching_engine

# High-fidelity object token clusters to detect hard object type conflicts
OBJECT_CLUSTERS: Dict[str, Set[str]] = {
    "bottles": {"bottle", "flask", "sipper", "thermos", "milton", "tupperware", "hydroflask", "canteen"},
    "audio": {"earbuds", "airpods", "earphones", "headphones", "tws", "buds", "headset", "airpod", "earbud", "airdopes", "boat"},
    "computers": {"laptop", "macbook", "thinkpad", "dell", "hp", "lenovo", "asus", "acer", "notebook"},
    "phones": {"phone", "smartphone", "iphone", "android", "samsung", "oneplus", "redmi", "pixel", "realme"},
    "keys": {"key", "keys", "keychain", "lanyard", "bike key", "room key"},
    "cards": {"id", "card", "license", "hallticket", "hall ticket", "smartcard", "usn card", "admit card"},
    "bags": {"backpack", "bag", "pouch", "purse", "wallet", "handbag", "duffel"},
    "eyewear": {"glasses", "spectacles", "sunglasses", "specs", "frames"},
    "calculators": {"calculator", "casio", "fx991", "fx-991"},
    "umbrellas": {"umbrella"},
    "chargers": {"charger", "adapter", "powerbank", "cable", "usb"}
}

STOP_WORDS = {
    "the", "a", "an", "in", "at", "on", "of", "to", "for", "with", "my", "i", 
    "lost", "found", "item", "please", "is", "it", "and", "or", "near", "from", 
    "by", "color", "colour", "brand", "model", "help", "nie", "north", "block"
}


class MatchingService:
    def __init__(self, db: Session):
        self.db = db
        self.match_repo = MatchRepository(db)
        self.report_repo = ReportRepository(db)
        self.case_repo = VerificationRepository(db)
        self.msg_repo = MessageRepository(db)
        self.notif_service = NotificationService(db)
        self.audit_service = AuditService(db)

    def _extract_object_clusters(self, text: str) -> Set[str]:
        """Detect known physical object types from title/description."""
        tokens = set(re.findall(r'\b[a-zA-Z0-9_-]+\b', text.lower()))
        matched = set()
        for cluster_name, keywords in OBJECT_CLUSTERS.items():
            if tokens.intersection(keywords):
                matched.add(cluster_name)
        return matched

    def _compute_text_similarity(self, lost: ItemReport, found: ItemReport) -> Tuple[float, List[str]]:
        reasons = []
        t1 = f"{lost.title} {lost.description or ''}".lower()
        t2 = f"{found.title} {found.description or ''}".lower()

        c1 = self._extract_object_clusters(t1)
        c2 = self._extract_object_clusters(t2)

        # Hard object cluster conflict only if both have identified types, zero overlap, and differing categories
        if c1 and c2 and not c1.intersection(c2) and (lost.category.upper() != found.category.upper()):
            return 0.0, []

        tokens1 = set(re.findall(r'\b[a-zA-Z0-9_-]{2,}\b', t1)) - STOP_WORDS
        tokens2 = set(re.findall(r'\b[a-zA-Z0-9_-]{2,}\b', t2)) - STOP_WORDS

        if not tokens1 or not tokens2:
            return 0.0, reasons

        intersection = tokens1.intersection(tokens2)
        if not intersection:
            return 0.0, reasons

        jaccard = len(intersection) / len(tokens1.union(tokens2))
        coverage = len(intersection) / min(len(tokens1), len(tokens2))
        score = min(1.0, 0.40 * jaccard + 0.60 * coverage)

        matching_words = list(intersection)[:3]
        if score > 0.40:
            reasons.append(f"Matching context keywords: {', '.join(matching_words)}")

        return score, reasons

    def _resolve_image_path(self, storage_path: str) -> Optional[str]:
        if not storage_path:
            return None
        candidates = [
            os.path.join(settings.STORAGE_LOCAL_DIR, storage_path),
            os.path.join("uploads", storage_path),
            os.path.join("../uploads", storage_path),
            os.path.abspath(storage_path),
            os.path.join("/run/media/zayan/Local Disk/SAHAYAK/uploads", storage_path)
        ]
        for c in candidates:
            if os.path.exists(c) and os.path.isfile(c):
                return c
        return None

    def _compute_visual_similarity(self, lost: ItemReport, found: ItemReport) -> Tuple[float, List[str], Optional[str], Optional[str], float]:
        reasons = []
        lost_img = lost.images[0] if lost.images else None
        found_img = found.images[0] if found.images else None

        if not lost_img or not found_img:
            return 0.0, reasons, None, None, 0.0

        # Attempt to read both images from storage
        path1 = self._resolve_image_path(lost_img.storage_path)
        path2 = self._resolve_image_path(found_img.storage_path)

        if not path1 or not path2:
            return 0.0, reasons, None, None, 0.0

        try:
            with open(path1, "rb") as f1, open(path2, "rb") as f2:
                b1 = f1.read()
                b2 = f2.read()

            pipeline = get_vision_pipeline()
            matcher = get_matching_engine()

            res1 = pipeline.process_image(b1, filename=lost_img.storage_path)
            res2 = pipeline.process_image(b2, filename=found_img.storage_path)

            if res1.items and res2.items:
                comp = matcher.compare_items(res1.items[0], res2.items[0])
                desc_a = comp.description_a or res1.items[0].description
                desc_b = comp.description_b or res2.items[0].description
                desc_sim = comp.signals.description_similarity or 0.0

                if not comp.class_compatible or comp.confidence < 0:
                    # Incompatible class rejection
                    reasons.extend(comp.reasons)
                    return -1.0, reasons, desc_a, desc_b, desc_sim

                if comp.confidence > 0.40:
                    reasons.extend(comp.reasons[:3])
                return comp.confidence, reasons, desc_a, desc_b, desc_sim
        except Exception as e:
            logger.debug(f"Visual AI comparison fallback note: {e}")

        return 0.0, reasons, None, None, 0.0

    def calculate_signals(self, lost: ItemReport, found: ItemReport) -> Tuple[float, Dict[str, Any], List[str]]:
        reasons = []

        # 1. Visual Similarity (Real YOLOv8 + OpenCLIP + Caption Generation + ORB)
        visual_score, visual_reasons, desc_a, desc_b, desc_sim = self._compute_visual_similarity(lost, found)

        # 2. Category similarity & Compatibility Gate
        cat_lost = (lost.category or "OTHER").lower().strip()
        cat_found = (found.category or "OTHER").lower().strip()
        category_match = (cat_lost == cat_found)
        category_score = 1.0 if category_match else 0.0

        # Hard Class Incompatibility Rejection Check
        if visual_score < 0:
            # Negative penalty from YOLO / Vision class mismatch
            signals = {
                "visual": -1.0,
                "text": 0.0,
                "location": 0.0,
                "time": 0.0,
                "category": -1.0,
                "attribute": 0.0,
                "description_a": desc_a,
                "description_b": desc_b,
                "description_similarity": desc_sim,
                "class_penalty": -1.0,
                "class_compatible": False
            }
            return 0.0, signals, visual_reasons

        # 3. Text Similarity (Real token overlap)
        text_score, text_reasons = self._compute_text_similarity(lost, found)
        reasons.extend(text_reasons)
        reasons.extend(visual_reasons)

        if category_match and cat_lost != "other":
            reasons.append(f"Matching item category ({lost.category})")

        # 4. Attribute match (Brand, Color, Model)
        attr_matches = 0
        attr_total = 0
        if lost.brand and found.brand:
            attr_total += 1
            if lost.brand.lower().strip() == found.brand.lower().strip():
                attr_matches += 1
                reasons.append(f"Matching brand ({lost.brand})")

        if lost.color and found.color:
            attr_total += 1
            if lost.color.lower().strip() == found.color.lower().strip():
                attr_matches += 1
                reasons.append(f"Matching color appearance ({lost.color})")

        attribute_score = (attr_matches / attr_total) if attr_total > 0 else 0.0

        # 5. Location proximity
        location_score = 0.0
        if lost.place_id and found.place_id and lost.place_id == found.place_id:
            location_score = 1.0
            reasons.append(f"Exact same campus location ({lost.incident_place})")
        elif lost.incident_place and found.incident_place:
            if lost.incident_place.lower() in found.incident_place.lower() or found.incident_place.lower() in lost.incident_place.lower():
                location_score = 0.85
                reasons.append(f"Proximate campus area ({lost.incident_place})")
            else:
                location_score = 0.30

        # 6. Time proximity
        time_score = 0.0
        if lost.event_date and found.event_date:
            try:
                d1 = datetime.strptime(lost.event_date[:10], "%Y-%m-%d")
                d2 = datetime.strptime(found.event_date[:10], "%Y-%m-%d")
                delta_days = abs((d1 - d2).days)
                if delta_days == 0:
                    time_score = 1.0
                    reasons.append("Reported on the exact same date")
                elif delta_days <= 2:
                    time_score = 0.85
                    reasons.append("Reported within 48 hours of loss")
                elif delta_days <= 7:
                    time_score = 0.50
                else:
                    time_score = 0.20
            except Exception:
                time_score = 0.40

        # -------------------------------------------------------------
        # TWO-STAGE HIERARCHICAL FUSION (Item Identity vs Spatiotemporal)
        # -------------------------------------------------------------
        if visual_score > 0.0:
            content_identity = (visual_score * 0.45) + (desc_sim * 0.25) + (text_score * 0.20) + (attribute_score * 0.10)
        else:
            content_identity = (text_score * 0.70) + (attribute_score * 0.30)

        # Apply Category Gate
        if category_score == 0.0 and cat_lost != "other" and cat_found != "other":
            content_identity *= 0.05

        if content_identity < 0.25:
            overall_score = round(content_identity * 0.20, 2)
            reasons = []
        else:
            context_score = (location_score * 0.60) + (time_score * 0.40)
            overall_score = round((content_identity * 0.70) + (context_score * 0.30), 2)

        overall_score = min(0.99, max(0.0, overall_score))

        signals = {
            "visual": round(max(0.0, visual_score), 2),
            "text": round(text_score, 2),
            "location": round(location_score, 2),
            "time": round(time_score, 2),
            "category": round(category_score, 2),
            "attribute": round(attribute_score, 2),
            "description_a": desc_a,
            "description_b": desc_b,
            "description_similarity": round(desc_sim, 2),
            "class_penalty": 0.0,
            "class_compatible": True
        }

        return overall_score, signals, reasons

    def run_matching_for_report(self, target_report: ItemReport) -> List[PotentialMatch]:
        """Find candidates across database and compute similarity scores."""
        target_type = target_report.report_type.upper()
        candidate_type = ReportType.FOUND.value if target_type == ReportType.LOST.value else ReportType.LOST.value

        candidates = self.report_repo.get_all(
            report_type=candidate_type,
            limit=50
        )

        matches_created = []

        for cand in candidates:
            # Skip if already closed or returned
            if cand.status in [ReportStatus.RETURNED.value, ReportStatus.CLOSED.value]:
                continue

            lost_rep = target_report if target_type == ReportType.LOST.value else cand
            found_rep = cand if target_type == ReportType.LOST.value else target_report

            score, signals, reasons = self.calculate_signals(lost_rep, found_rep)

            meta_dict = {
                "description_a": signals.get("description_a"),
                "description_b": signals.get("description_b"),
                "description_similarity": signals.get("description_similarity", 0.0),
                "class_penalty": signals.get("class_penalty", 0.0),
                "class_compatible": signals.get("class_compatible", True),
                "clues": reasons[:3]
            }

            if score >= settings.MATCH_SCORE_THRESHOLD:
                existing = self.match_repo.get_by_reports(lost_rep.id, found_rep.id)
                if existing:
                    existing.similarity_score = score
                    existing.visual_score = signals["visual"]
                    existing.text_score = signals["text"]
                    existing.location_score = signals["location"]
                    existing.time_score = signals["time"]
                    existing.category_score = signals["category"]
                    existing.attribute_score = signals["attribute"]
                    existing.reasons_json = json.dumps(reasons)
                    existing.match_clues_json = json.dumps(meta_dict)
                    self.match_repo.update(existing)
                    matches_created.append(existing)
                    self._notify_and_create_conversation_for_match(existing, lost_rep, found_rep, score, reasons)
                else:
                    match_obj = PotentialMatch(
                        id=f"mat_{uuid.uuid4().hex[:10]}",
                        lost_report_id=lost_rep.id,
                        found_report_id=found_rep.id,
                        similarity_score=score,
                        visual_score=signals["visual"],
                        text_score=signals["text"],
                        location_score=signals["location"],
                        time_score=signals["time"],
                        category_score=signals["category"],
                        attribute_score=signals["attribute"],
                        reasons_json=json.dumps(reasons),
                        match_clues_json=json.dumps(meta_dict),
                        status=MatchStatus.PENDING_REVIEW.value
                    )
                    self.match_repo.create(match_obj)
                    matches_created.append(match_obj)
                    self._notify_and_create_conversation_for_match(match_obj, lost_rep, found_rep, score, reasons)

        return matches_created

    def _notify_and_create_conversation_for_match(
        self,
        match_obj: PotentialMatch,
        lost_rep: ItemReport,
        found_rep: ItemReport,
        score: float,
        reasons: List[str]
    ):
        """Creates a secure verification/messaging room and sends notifications to BOTH parties."""
        pct = int(round(score * 100)) if score <= 1.0 else int(score)
        
        # 1. Ensure a shared verification & messaging conversation case exists
        case = self.case_repo.get_by_match_id(match_obj.id)
        if not case:
            case = VerificationCase(
                id=f"case_{uuid.uuid4().hex[:8]}",
                match_id=match_obj.id,
                lost_report_id=lost_rep.id,
                found_report_id=found_rep.id,
                claimant_id=lost_rep.reporter_id,
                finder_id=found_rep.reporter_id,
                status=VerificationStatus.AWAITING_CLAIMANT.value,
                confidence_rating="High" if score >= 0.8 else "Moderate",
                attempts_count=0,
                max_attempts=3
            )
            self.case_repo.create_case(case)

            # Post the initial automated radar match report message into the conversation
            clues_text = ", ".join(reasons[:2]) if reasons else "High image, textual and campus location compatibility"
            system_msg = Message(
                id=f"msg_{uuid.uuid4().hex[:10]}",
                case_id=case.id,
                sender_id="system",
                sender_name="SAHAYAK Neural Match Radar",
                sender_role="SYSTEM",
                content=(
                    f"🤖 Match Radar Report ({pct}% Confidence Match):\n"
                    f"• Lost Item: {lost_rep.title} (#{lost_rep.tracking_number or lost_rep.id})\n"
                    f"• Found Item: {found_rep.title} (#{found_rep.tracking_number or found_rep.id})\n"
                    f"• Discovery Area: {found_rep.incident_place}\n"
                    f"• Signals: {clues_text}\n"
                    f"Both parties can now message here safely to coordinate verification and handover with NIE Security."
                ),
                read=False,
                is_system_message=True,
                timestamp=datetime.now(timezone.utc)
            )
            self.msg_repo.create(system_msg)

        # 2. Send Notification to the PERSON WHO LOST THE ITEM
        if lost_rep.reporter_id:
            self.notif_service.send_notification(
                user_id=lost_rep.reporter_id,
                title="🎯 Match Radar: Potential Found Item Detected!",
                body=f"A found '{found_rep.title}' at {found_rep.incident_place} matches your lost '{lost_rep.title}' ({pct}% match). Tap to review and message the finder.",
                notif_type=NotificationType.MATCH_FOUND.value,
                related_case_id=match_obj.id,
                link_url=f"/student/matches/{match_obj.id}"
            )

        # 3. Send Notification to the PERSON WHO FOUND THE ITEM
        if found_rep.reporter_id:
            self.notif_service.send_notification(
                user_id=found_rep.reporter_id,
                title="🎯 Match Radar: Potential Lost Item Owner Identified!",
                body=f"A lost report for '{lost_rep.title}' at {lost_rep.incident_place} matches the '{found_rep.title}' you reported found ({pct}% match). Tap to review and message the claimant.",
                notif_type=NotificationType.MATCH_FOUND.value,
                related_case_id=match_obj.id,
                link_url=f"/student/matches/{match_obj.id}"
            )

    def rescan_all_matches(self) -> List[PotentialMatch]:
        """Runs Match Radar across all active Lost & Found database items."""
        lost_reports = self.report_repo.get_all(report_type=ReportType.LOST.value, limit=100)
        found_reports = self.report_repo.get_all(report_type=ReportType.FOUND.value, limit=100)

        all_matches = []
        for lost_rep in lost_reports:
            if lost_rep.status in [ReportStatus.RETURNED.value, ReportStatus.CLOSED.value]:
                continue
            for found_rep in found_reports:
                if found_rep.status in [ReportStatus.RETURNED.value, ReportStatus.CLOSED.value]:
                    continue

                score, signals, reasons = self.calculate_signals(lost_rep, found_rep)

                meta_dict = {
                    "description_a": signals.get("description_a"),
                    "description_b": signals.get("description_b"),
                    "description_similarity": signals.get("description_similarity", 0.0),
                    "class_penalty": signals.get("class_penalty", 0.0),
                    "class_compatible": signals.get("class_compatible", True),
                    "clues": reasons[:3]
                }

                if score >= settings.MATCH_SCORE_THRESHOLD:
                    existing = self.match_repo.get_by_reports(lost_rep.id, found_rep.id)
                    if existing:
                        existing.similarity_score = score
                        existing.visual_score = signals["visual"]
                        existing.text_score = signals["text"]
                        existing.location_score = signals["location"]
                        existing.time_score = signals["time"]
                        existing.category_score = signals["category"]
                        existing.attribute_score = signals["attribute"]
                        existing.reasons_json = json.dumps(reasons)
                        existing.match_clues_json = json.dumps(meta_dict)
                        self.match_repo.update(existing)
                        all_matches.append(existing)
                        self._notify_and_create_conversation_for_match(existing, lost_rep, found_rep, score, reasons)
                    else:
                        match_obj = PotentialMatch(
                            id=f"mat_{uuid.uuid4().hex[:10]}",
                            lost_report_id=lost_rep.id,
                            found_report_id=found_rep.id,
                            similarity_score=score,
                            visual_score=signals["visual"],
                            text_score=signals["text"],
                            location_score=signals["location"],
                            time_score=signals["time"],
                            category_score=signals["category"],
                            attribute_score=signals["attribute"],
                            reasons_json=json.dumps(reasons),
                            match_clues_json=json.dumps(meta_dict),
                            status=MatchStatus.PENDING_REVIEW.value
                        )
                        self.match_repo.create(match_obj)
                        all_matches.append(match_obj)
                        self._notify_and_create_conversation_for_match(match_obj, lost_rep, found_rep, score, reasons)

        return all_matches

    def get_matches_for_user(self, user_id: str) -> List[PotentialMatch]:
        user_reports = self.report_repo.get_all(reporter_id=user_id)
        user_report_ids = [r.id for r in user_reports]
        all_matches = self.match_repo.get_all(min_score=settings.MATCH_SCORE_THRESHOLD)
        return [m for m in all_matches if m.lost_report_id in user_report_ids or m.found_report_id in user_report_ids]

