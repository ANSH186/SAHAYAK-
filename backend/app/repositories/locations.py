from typing import List, Optional
from sqlalchemy.orm import Session
from app.db.models.location import CampusLocation


class LocationRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, loc_id: str) -> Optional[CampusLocation]:
        return self.db.query(CampusLocation).filter(CampusLocation.id == loc_id).first()

    def get_by_name(self, name: str) -> Optional[CampusLocation]:
        return self.db.query(CampusLocation).filter(CampusLocation.name.ilike(f"%{name}%")).first()

    def get_all(self) -> List[CampusLocation]:
        return self.db.query(CampusLocation).order_by(CampusLocation.name.asc()).all()

    def create(self, loc: CampusLocation) -> CampusLocation:
        self.db.add(loc)
        self.db.commit()
        self.db.refresh(loc)
        return loc

    def update(self, loc: CampusLocation) -> CampusLocation:
        self.db.commit()
        self.db.refresh(loc)
        return loc
