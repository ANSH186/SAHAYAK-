import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models.user import User
from app.db.models.match import PotentialMatch
from app.core.permissions import get_current_user, get_optional_current_user
from app.api.v1.routes.reports import format_report_dict
from app.repositories.matches import MatchRepository
from app.services.matching_service import MatchingService
from app.utils.formatters import api_response

router = APIRouter(prefix="/matches", tags=["Matches"])


def format_match_dict(m: PotentialMatch) -> dict:
    reasons = json.loads(m.reasons_json) if m.reasons_json else []
    match_clues_raw = json.loads(m.match_clues_json) if m.match_clues_json else []

    desc_a = None
    desc_b = None
    desc_sim = None
    class_penalty = 0.0
    class_compatible = True
    clues_list = []

    if isinstance(match_clues_raw, dict):
        desc_a = match_clues_raw.get("description_a")
        desc_b = match_clues_raw.get("description_b")
        desc_sim = match_clues_raw.get("description_similarity")
        class_penalty = match_clues_raw.get("class_penalty", 0.0)
        class_compatible = match_clues_raw.get("class_compatible", True)
        clues_list = match_clues_raw.get("clues", [])
    elif isinstance(match_clues_raw, list):
        clues_list = match_clues_raw

    # Compute percentage scores (0-100) for frontend display
    sim_pct = int(round(m.similarity_score * 100)) if m.similarity_score <= 1.0 else int(m.similarity_score)
    vis_pct = int(round((m.visual_score or 0.0) * 100)) if (m.visual_score or 0.0) <= 1.0 else int(m.visual_score)
    txt_pct = int(round((m.text_score or 0.0) * 100)) if (m.text_score or 0.0) <= 1.0 else int(m.text_score)
    loc_pct = int(round((m.location_score or 0.0) * 100)) if (m.location_score or 0.0) <= 1.0 else int(m.location_score)
    time_pct = int(round((m.time_score or 0.0) * 100)) if (m.time_score or 0.0) <= 1.0 else int(m.time_score)
    attr_pct = int(round((m.attribute_score or 0.0) * 100)) if (m.attribute_score or 0.0) <= 1.0 else int(m.attribute_score)
    desc_pct = int(round((desc_sim or 0.0) * 100)) if desc_sim is not None else None

    return {
        "id": m.id,
        "lostReportId": m.lost_report_id,
        "foundReportId": m.found_report_id,
        "similarityScore": sim_pct,
        "similarity_score": m.similarity_score,
        "signals": {
            "categoryMatch": m.category_score >= 0.8,
            "imageSimilarity": vis_pct,
            "imageSimilarityScore": m.visual_score,
            "textSimilarity": txt_pct,
            "textSimilarityScore": m.text_score,
            "locationScore": loc_pct,
            "locationProximityScore": m.location_score,
            "timeScore": time_pct,
            "timeProximityScore": m.time_score,
            "attributeMatchScore": attr_pct,
            "descriptionA": desc_a,
            "descriptionB": desc_b,
            "descriptionSimilarity": desc_pct,
            "classPenalty": class_penalty,
            "classCompatible": class_compatible,
            "reasons": reasons
        },
        "status": m.status,
        "lostReport": format_report_dict(m.lost_report) if m.lost_report else None,
        "foundReport": format_report_dict(m.found_report) if m.found_report else None,
        "matchClues": clues_list,
        "suggestedAt": m.created_at.isoformat() if m.created_at else None,
        "createdAt": m.created_at.isoformat() if m.created_at else None
    }


@router.post("/scan", summary="Trigger neural AI scan across all active database items")
def trigger_radar_scan(
    db: Session = Depends(get_db)
):
    svc = MatchingService(db)
    matches = svc.rescan_all_matches()
    data = [format_match_dict(m) for m in matches]
    return api_response(data, meta={"message": f"Radar scan complete. Evaluated {len(matches)} high-confidence candidate matches."})


@router.get("", summary="Get potential matches for user or campus radar")
def list_matches(
    report_id: Optional[str] = None,
    min_score: float = 0.50,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    svc = MatchingService(db)
    if report_id:
        repo = MatchRepository(db)
        matches = repo.get_all(report_id=report_id, min_score=min_score)
    elif current_user:
        matches = svc.get_matches_for_user(current_user.id)
        if not matches:
            repo = MatchRepository(db)
            matches = repo.get_all(min_score=min_score, limit=20)
    else:
        repo = MatchRepository(db)
        matches = repo.get_all(min_score=min_score, limit=20)

    data = [format_match_dict(m) for m in matches]
    return api_response(data)


@router.get("/{match_id}", summary="Get match details and signal breakdown")
def get_match(match_id: str, db: Session = Depends(get_db)):
    repo = MatchRepository(db)
    match = repo.get_by_id(match_id)
    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Match with ID '{match_id}' not found."
        )
    return api_response(format_match_dict(match))
