#!/usr/bin/env python3
import os
import sys
import json
import shutil

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

from app.db.session import SessionLocal, engine, Base
from app.core.security import hash_password
from app.db.models import (
    User,
    StudentProfile,
    CampusLocation,
    ItemReport,
    ItemImage,
    PotentialMatch,
    VerificationCase,
    VerificationQuestion,
    HandoverRecord,
    RewardTransaction,
    Milestone,
    Notification,
    AuditLog
)


def reset_database():
    print("🧹 Resetting SAHAYAK Database - Removing all mock student and admin data...")
    db = SessionLocal()
    try:
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)

        # 1. Delete all mock transaction, report, match & case records
        db.query(AuditLog).delete()
        db.query(Notification).delete()
        db.query(Milestone).delete()
        db.query(RewardTransaction).delete()
        db.query(HandoverRecord).delete()
        db.query(VerificationQuestion).delete()
        db.query(VerificationCase).delete()
        db.query(PotentialMatch).delete()
        db.query(ItemImage).delete()
        db.query(ItemReport).delete()
        db.query(CampusLocation).delete()
        db.query(StudentProfile).delete()
        db.query(User).delete()
        db.commit()

        # 2. Re-seed only the NIE North Campus geo-locations (from nie_north.geojson)
        geojson_path = os.path.join(BASE_DIR, "..", "data", "nie_north.geojson")
        if os.path.exists(geojson_path):
            with open(geojson_path, "r", encoding="utf-8") as f:
                geo_data = json.load(f)

            for feature in geo_data.get("features", []):
                props = feature.get("properties", {})
                geom = feature.get("geometry", {})
                loc_id = feature.get("id") or props.get("id") or f"loc-{props.get('name', 'spot').lower().replace(' ', '-')}"
                coords = geom.get("coordinates", [])

                # Calculate center lat/lng
                if geom.get("type") == "Point" and len(coords) >= 2:
                    lng, lat = coords[0], coords[1]
                elif geom.get("type") == "Polygon" and coords and len(coords[0]) > 0:
                    poly = coords[0]
                    lng = sum(p[0] for p in poly) / len(poly)
                    lat = sum(p[1] for p in poly) / len(poly)
                else:
                    lat, lng = 12.3533, 76.5947

                loc = CampusLocation(
                    id=str(loc_id),
                    name=props.get("name", "NIE Location"),
                    zone=props.get("zone", "Central Campus"),
                    building=props.get("building") or props.get("name"),
                    latitude=lat,
                    longitude=lng,
                    has_collection_desk=props.get("has_desk", False),
                    geometry_geojson=json.dumps(geom),
                    item_count=0
                )
                db.add(loc)
            db.commit()
            print("📍 NIE North campus geo-locations loaded.")

        # 3. Create clean default Admin and Student users with 0 points
        admin_user = User(
            id="usr_admin_1",
            email="admin@nie.ac.in",
            password_hash=hash_password("Admin@123"),
            role="admin",
            status="active",
            full_name="Dr. H. S. Sridhar (Proctor Desk)",
            phone="+91 821 2480475",
            avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=AdminProctor"
        )
        db.add(admin_user)

        student_user = User(
            id="usr_student_1",
            email="student@nie.ac.in",
            password_hash=hash_password("Student@123"),
            role="student",
            status="active",
            full_name="Demo Student",
            phone="+91 98860 12345",
            avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=Student"
        )
        db.add(student_user)

        student_profile = StudentProfile(
            user_id="usr_student_1",
            usn="4NI22CS001",
            college_email="student@nie.ac.in",
            campus="NIE North Campus",
            branch="Computer Science & Engineering",
            semester=5,
            section="A",
            points_balance=0,
            recovered_count=0,
            streak_days=0,
            badge_level="Campus Samaritan (Novice)"
        )
        db.add(student_profile)
        db.commit()

        # 4. Clean uploads directory
        uploads_reports_dir = os.path.join(BASE_DIR, "..", "uploads", "reports")
        if os.path.exists(uploads_reports_dir):
            for file_name in os.listdir(uploads_reports_dir):
                file_path = os.path.join(uploads_reports_dir, file_name)
                try:
                    if os.path.isfile(file_path) or os.path.islink(file_path):
                        os.unlink(file_path)
                    elif os.path.isdir(file_path):
                        shutil.rmtree(file_path)
                except Exception as e:
                    print(f"Failed to delete {file_path}: {e}")

        print("✨ Database and system reset successfully! 0 mock reports, 0 mock cases, 0 mock matches.")
    finally:
        db.close()


if __name__ == "__main__":
    reset_database()
