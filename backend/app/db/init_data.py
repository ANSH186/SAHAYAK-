import os
import json
from app.core.logging import logger
from app.db.session import SessionLocal, engine, Base
from app.core.security import hash_password
import app.db.models as models


def auto_init_database():
    """
    Initializes database schema and populates baseline admin, student,
    and NIE North campus geographic landmarks if database is freshly provisioned.
    """
    try:
        # 1. Create tables if they do not exist
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables verified/created successfully.")
    except Exception as e:
        logger.error(f"Failed to create database tables: {e}")
        return

    db = SessionLocal()
    try:
        # 2. Check if users already exist
        user_count = db.query(models.User).count()
        if user_count == 0:
            logger.info("Fresh database detected: Creating default admin and student accounts...")
            admin_user = models.User(
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

            student_user = models.User(
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

            student_profile = models.StudentProfile(
                user_id="usr_student_1",
                usn="4NI22CS001",
                college_email="student@nie.ac.in",
                campus="NIE North Campus",
                branch="Computer Science & Engineering",
                semester=5,
                section="A",
                points_balance=100,
                recovered_count=0,
                streak_days=1,
                badge_level="Campus Samaritan"
            )
            db.add(student_profile)
            db.commit()
            logger.info("Default Admin and Student created.")

        # 3. Check if campus locations exist
        loc_count = db.query(models.CampusLocation).count()
        if loc_count == 0:
            logger.info("Loading NIE North Campus geo-locations...")
            possible_paths = [
                os.path.join(os.path.dirname(__file__), "../../../data/nie_north.geojson"),
                os.path.join(os.path.dirname(__file__), "../../data/nie_north.geojson"),
                os.path.abspath(os.path.join(os.getcwd(), "data/nie_north.geojson")),
                os.path.abspath(os.path.join(os.getcwd(), "backend/data/nie_north.geojson"))
            ]

            geojson_path = next((p for p in possible_paths if os.path.exists(p)), None)
            if geojson_path:
                with open(geojson_path, "r", encoding="utf-8") as f:
                    geo_data = json.load(f)

                for feature in geo_data.get("features", []):
                    props = feature.get("properties", {})
                    geom = feature.get("geometry", {})
                    loc_id = feature.get("id") or props.get("id") or f"loc-{props.get('name', 'spot').lower().replace(' ', '-')}"
                    coords = geom.get("coordinates", [])

                    if geom.get("type") == "Point" and len(coords) >= 2:
                        lng, lat = coords[0], coords[1]
                    elif geom.get("type") == "Polygon" and coords and len(coords[0]) > 0:
                        poly = coords[0]
                        lng = sum(p[0] for p in poly) / len(poly)
                        lat = sum(p[1] for p in poly) / len(poly)
                    else:
                        lat, lng = 12.3533, 76.5947

                    loc = models.CampusLocation(
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
                logger.info(f"Loaded NIE North campus locations from {geojson_path}.")
            else:
                logger.warning("Could not find nie_north.geojson to auto-seed campus locations.")
    except Exception as e:
        logger.error(f"Error during database initialization: {e}")
        db.rollback()
    finally:
        db.close()
