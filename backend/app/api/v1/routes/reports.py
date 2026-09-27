from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models.user import User
from app.db.models.report import ItemReport
from app.core.permissions import get_current_user, get_optional_current_user
from app.schemas.reports import ReportCreate, ReportResponse, StatusTransitionRequest
from app.services.report_service import ReportService
from app.services.image_service import ImageService
from app.utils.formatters import api_response


router = APIRouter(prefix="/reports", tags=["Reports"])


def format_report_dict(r: ItemReport) -> dict:
    images_list = []
    if r.images:
        for img in r.images:
            images_list.append({
                "id": img.id,
                "url": img.url,
                "source": img.source_type,
                "isPrimary": img.is_primary,
                "uploadedAt": img.created_at.isoformat() if img.created_at else None
            })

    track_no = r.tracking_number or f"NIE-{r.report_type[:3]}-{r.id[-5:].upper()}"
    anti_fraud = r.anti_fraud_code or f"SEC-{abs(hash(r.id)) % 900000 + 100000}"

    return {
        "id": r.id,
        "type": r.report_type,
        "report_type": r.report_type,
        "trackingNumber": track_no,
        "tracking_number": track_no,
        "antiFraudCode": anti_fraud,
        "anti_fraud_code": anti_fraud,
        "securityClaimPin": anti_fraud,
        "title": r.title,
        "category": r.category,
        "description": r.description,
        "incidentPlace": r.incident_place,
        "incident_place": r.incident_place,
        "currentLocation": r.current_location,
        "current_location": r.current_location,
        "incidentDate": r.event_date,
        "event_date": r.event_date,
        "incidentTime": r.event_time,
        "event_time": r.event_time,
        "brand": r.brand,
        "model": r.model,
        "color": r.color,
        "material": r.material,
        "size": r.size,
        "distinguishingFeatures": r.distinguishing_marks,
        "distinguishing_marks": r.distinguishing_marks,
        "serial_number": r.serial_number,
        "status": r.status,
        "rewardPointsEligible": r.reward_points_eligible,
        "isAnonymous": r.is_anonymous,
        "reporterId": r.reporter_id,
        "reporterName": "Anonymous Finder" if r.is_anonymous else r.reporter_name,
        "reporterUSN": "Protected" if r.is_anonymous else r.reporter_usn,
        "images": images_list,
        "createdAt": r.created_at.isoformat() if r.created_at else None,
        "updatedAt": r.updated_at.isoformat() if r.updated_at else None
    }


@router.get("", summary="List Lost and Found reports")
def list_reports(
    type: Optional[str] = Query(None, description="LOST or FOUND"),
    category: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    reporter_id: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    svc = ReportService(db)
    reports = svc.get_reports(
        report_type=type,
        category=category,
        status_filter=status,
        search=search,
        reporter_id=reporter_id,
        limit=limit,
        offset=offset
    )
    data = [format_report_dict(r) for r in reports]
    return api_response(data, meta={"total": len(data), "limit": limit, "offset": offset})


@router.get("/{report_id}", summary="Get report by ID")
def get_report(report_id: str, db: Session = Depends(get_db)):
    svc = ReportService(db)
    report = svc.get_report_by_id(report_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report with ID '{report_id}' was not found."
        )
    return api_response(format_report_dict(report))


@router.post("", summary="Create a new Lost or Found report")
def create_report(req: ReportCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    svc = ReportService(db)
    created = svc.create_report(req, reporter=current_user)
    return api_response(format_report_dict(created))


@router.post("/{report_id}/images", summary="Upload and attach an image to a report")
async def upload_report_image(
    report_id: str,
    file: UploadFile = File(...),
    is_primary: bool = Form(False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    svc = ImageService(db)
    img_record = await svc.process_and_save_upload(
        report_id=report_id,
        file=file,
        is_primary=is_primary
    )
    return api_response({
        "id": img_record.id,
        "url": img_record.url,
        "reportId": img_record.report_id,
        "isPrimary": img_record.is_primary
    })


@router.patch("/{report_id}/status", summary="Transition report status through state machine")
def update_report_status(
    report_id: str,
    req: StatusTransitionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    svc = ReportService(db)
    updated = svc.update_report_status(report_id, req.new_status, actor=current_user, notes=req.notes)
    return api_response(format_report_dict(updated))
