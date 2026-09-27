from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models.user import User
from app.core.permissions import get_current_admin
from app.api.v1.routes.reports import format_report_dict
from app.api.v1.routes.matches import format_match_dict
from app.repositories.reports import ReportRepository
from app.repositories.matches import MatchRepository
from app.repositories.verification import VerificationRepository
from app.repositories.rewards import RewardRepository
from app.repositories.audit import AuditRepository
from app.repositories.notifications import NotificationRepository
from app.services.analytics_service import AnalyticsService
from app.services.location_service import LocationService
from app.utils.formatters import api_response

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/dashboard", summary="Admin executive dashboard overview")
def get_dashboard_metrics(current_admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    svc = AnalyticsService(db)
    metrics = svc.get_dashboard_metrics()
    return api_response(metrics.model_dump())


@router.get("/reports", summary="Admin case and reports management list")
def list_admin_reports(
    type: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    repo = ReportRepository(db)
    reports = repo.get_all(report_type=type, category=category, status=status, search=search, limit=100)
    return api_response([format_report_dict(r) for r in reports])


@router.get("/reports/{report_id}", summary="Admin detailed report view")
def get_admin_report(report_id: str, current_admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    repo = ReportRepository(db)
    report = repo.get_by_id(report_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report '{report_id}' not found."
        )
    return api_response(format_report_dict(report))


@router.get("/matches", summary="Admin match engine diagnostics and confidence audit")
def list_admin_matches(current_admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    repo = MatchRepository(db)
    matches = repo.get_all(min_score=0.30, limit=50)
    return api_response([format_match_dict(m) for m in matches])


@router.get("/locations", summary="Admin campus location and inventory manager")
def get_admin_locations(current_admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    svc = LocationService(db)
    locs = svc.get_all_locations()
    return api_response([
        {
            "id": l.id,
            "name": l.name,
            "zone": l.zone,
            "building": l.building,
            "latitude": l.latitude,
            "longitude": l.longitude,
            "hasCollectionDesk": l.has_collection_desk,
            "itemCount": l.item_count
        }
        for l in locs
    ])


@router.get("/resolution", summary="Admin resolution rate and throughput analytics")
def get_resolution_analytics(current_admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    svc = AnalyticsService(db)
    metrics = svc.get_dashboard_metrics()
    return api_response({
        "averageResolutionDays": metrics.averageResolutionDays,
        "recoveryRatePercentage": metrics.recoveryRatePercentage,
        "verifiedRecoveries": metrics.verifiedRecoveries,
        "monthlyTrend": metrics.monthlyTrend
    })


@router.get("/rewards", summary="Admin rewards and points auditing")
def get_rewards_audit(current_admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    repo = RewardRepository(db)
    txs = repo.get_all_transactions(limit=100)
    return api_response([
        {
            "id": t.id,
            "userId": t.user_id,
            "caseId": t.case_id,
            "points": t.points,
            "reason": t.reason,
            "badgeAwarded": t.badge_awarded,
            "date": t.created_at.strftime("%b %d, %Y") if t.created_at else None
        }
        for t in txs
    ])


@router.get("/audit", summary="Admin immutable security audit trail")
def get_audit_trail(limit: int = 50, current_admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    repo = AuditRepository(db)
    logs = repo.get_all(limit=limit)
    return api_response([
        {
            "id": l.id,
            "timestamp": l.timestamp.isoformat() if l.timestamp else None,
            "eventType": l.event_type,
            "actor": l.actor_name or l.actor_id or "SYSTEM",
            "actorName": l.actor_name or "Unknown",
            "actorRole": l.actor_role,
            "caseId": l.case_id,
            "status": l.status,
            "description": l.description
        }
        for l in logs
    ])


@router.get("/notifications", summary="Admin system-wide broadcast notifications")
def get_admin_notifications(current_admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    repo = NotificationRepository(db)
    notifs = repo.get_by_user_id(current_admin.id)
    return api_response([
        {
            "id": n.id,
            "type": n.type,
            "title": n.title,
            "message": n.body,
            "timestamp": n.created_at.isoformat() if n.created_at else None
        }
        for n in notifs
    ])
