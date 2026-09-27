import re
from typing import Dict, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from app.db.models.location import CampusLocation
from app.db.models.report import ItemReport
from app.repositories.locations import LocationRepository
from app.repositories.reports import ReportRepository

# Keyword map for auto-linking incident places to known campus coordinates
CAMPUS_ZONE_MAP = {
    "loc-mv-block": ["sir mv", "mv block", "main block", "mb block", "academic block"],
    "loc-sb-block": ["sb block", "computing", "ai lab", "cs lab", "ise lab"],
    "loc-library": ["library", "reading room", "digital library", "stack section"],
    "loc-canteen": ["canteen", "cafeteria", "food court", "nescafe", "dining"],
    "loc-admin-desk": ["admin", "proctor", "principal", "accounts", "office"],
    "loc-security-gate": ["main gate", "gate 1", "security desk", "entrance", "guard"],
    "loc-parking": ["parking", "two-wheeler", "bike stand", "ground", "cycle"]
}


class LocationService:
    def __init__(self, db: Session):
        self.db = db
        self.loc_repo = LocationRepository(db)
        self.report_repo = ReportRepository(db)

    def match_place_id_from_text(self, text: str) -> Optional[str]:
        """Automatically resolve place_id from freeform text."""
        if not text:
            return None
        text_lower = text.lower()
        for loc_id, keywords in CAMPUS_ZONE_MAP.items():
            for kw in keywords:
                if kw in text_lower:
                    return loc_id
        return None

    def get_all_locations(self) -> List[CampusLocation]:
        locations = self.loc_repo.get_all()
        all_reports = self.db.query(ItemReport).all()

        for loc in locations:
            # Count matching reports by place_id or keyword match
            matching_keywords = CAMPUS_ZONE_MAP.get(loc.id, [loc.name.lower()])
            count = 0
            for r in all_reports:
                if r.place_id == loc.id:
                    count += 1
                elif r.incident_place:
                    r_text = r.incident_place.lower()
                    if any(kw in r_text for kw in matching_keywords):
                        count += 1
            loc.item_count = count
        return locations

    def get_location_by_id(self, loc_id: str) -> Optional[CampusLocation]:
        return self.loc_repo.get_by_id(loc_id)

    def get_campus_heatmap(self) -> Dict:
        """Return real-time live heatmap generated directly from existing reports in database."""
        locations = self.get_all_locations()
        all_reports = self.db.query(ItemReport).all()
        
        points = []
        live_items = []

        for loc in locations:
            matching_keywords = CAMPUS_ZONE_MAP.get(loc.id, [loc.name.lower()])
            loc_lost_count = 0
            loc_found_count = 0
            loc_returned_count = 0

            for r in all_reports:
                is_match = False
                if r.place_id == loc.id:
                    is_match = True
                elif r.incident_place:
                    r_text = r.incident_place.lower()
                    if any(kw in r_text for kw in matching_keywords):
                        is_match = True

                if is_match:
                    if r.status in ["RETURNED", "SAFELY_RETURNED", "CLOSED"]:
                        loc_returned_count += 1
                    elif r.report_type == "LOST":
                        loc_lost_count += 1
                    elif r.report_type == "FOUND":
                        loc_found_count += 1

                    # Add to live items pin list with slight randomized jitter for multiple pins
                    jitter_lat = (hash(r.id + "lat") % 100 - 50) * 0.00003
                    jitter_lng = (hash(r.id + "lng") % 100 - 50) * 0.00003

                    img_url = r.images[0].url if r.images else None

                    live_items.append({
                        "id": r.id,
                        "title": r.title,
                        "category": r.category,
                        "type": r.report_type,
                        "status": r.status,
                        "locationName": loc.name,
                        "incidentPlace": r.incident_place,
                        "eventDate": r.event_date,
                        "eventTime": r.event_time,
                        "latitude": loc.latitude + jitter_lat,
                        "longitude": loc.longitude + jitter_lng,
                        "imageUrl": img_url
                    })

            total_active = loc_lost_count + loc_found_count
            intensity = min(1.0, total_active * 0.25 + (0.1 if total_active > 0 else 0.0))

            points.append({
                "locationId": loc.id,
                "name": loc.name,
                "zone": loc.zone,
                "building": loc.building,
                "latitude": loc.latitude,
                "longitude": loc.longitude,
                "intensity": round(intensity, 2),
                "totalCount": loc_lost_count + loc_found_count + loc_returned_count,
                "lostCount": loc_lost_count,
                "foundCount": loc_found_count,
                "returnedCount": loc_returned_count,
                "hasCollectionDesk": loc.has_collection_desk
            })

        return {
            "campus": "NIE North Campus, Mysuru",
            "dataSource": "LIVE_DATABASE_AGGREGATE",
            "totalReports": len(all_reports),
            "totalLocations": len(points),
            "points": points,
            "liveItems": live_items
        }

