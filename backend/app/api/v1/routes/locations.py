from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.location_service import LocationService
from app.utils.formatters import api_response

router = APIRouter(prefix="/locations", tags=["Locations"])


@router.get("", summary="Get all NIE North campus locations")
def list_locations(db: Session = Depends(get_db)):
    svc = LocationService(db)
    locations = svc.get_all_locations()
    data = [
        {
            "id": loc.id,
            "name": loc.name,
            "campus": loc.campus,
            "zone": loc.zone,
            "building": loc.building,
            "floor": loc.floor,
            "room": loc.room,
            "latitude": loc.latitude,
            "longitude": loc.longitude,
            "locationType": loc.location_type,
            "hasCollectionDesk": loc.has_collection_desk,
            "itemCount": loc.item_count
        }
        for loc in locations
    ]
    return api_response(data)


@router.get("/heatmap", summary="Get aggregated campus heatmap density data")
def get_heatmap(db: Session = Depends(get_db)):
    svc = LocationService(db)
    data = svc.get_campus_heatmap()
    return api_response(data)
