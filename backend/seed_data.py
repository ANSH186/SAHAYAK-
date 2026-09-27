#!/usr/bin/env python3
import json
import os
import sys
import uuid
from datetime import datetime, timezone, timedelta

# Ensure backend root is in sys.path
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
from app.integrations.embedding import get_embedding_provider


def seed(db=None):
    print("🌱 Initializing SAHAYAK Database Seeding...")
    close_at_end = False
    if db is None:
        db = SessionLocal()
        close_at_end = True
    embedding_provider = get_embedding_provider()

    try:
        Base.metadata.create_all(bind=engine)

        # Clear existing tables to ensure clean seed
        print("Database refreshing records with exact nie_north.geojson coordinates...")
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

        # 1. Seed Campus Locations (NIE North Campus)
        print("📍 Seeding NIE North Campus Locations...")
        locations_data = [
            {
                "id": "loc-mv-block",
                "name": "MB block (Sir MV Main Academic Block)",
                "campus": "NIE North Campus",
                "zone": "Academic Zone",
                "building": "MB Block",
                "floor": "2nd Floor",
                "room": "MB-204 Lecture Hall",
                "latitude": 12.3713084,
                "longitude": 76.5869772,
                "location_type": "ACADEMIC_BLOCK",
                "has_collection_desk": True
            },
            {
                "id": "loc-sb-block",
                "name": "SB block (LAB building)",
                "campus": "NIE North Campus",
                "zone": "Lab Zone",
                "building": "SB Block",
                "floor": "3rd Floor",
                "room": "CS Lab 4",
                "latitude": 12.3714376,
                "longitude": 76.5847868,
                "location_type": "LABORATORY",
                "has_collection_desk": False
            },
            {
                "id": "loc-library",
                "name": "NIE Library",
                "campus": "NIE North Campus",
                "zone": "Academic Zone",
                "building": "Library Complex",
                "floor": "1st Floor",
                "room": "Reading Hall West",
                "latitude": 12.3715731,
                "longitude": 76.587176,
                "location_type": "LIBRARY",
                "has_collection_desk": True
            },
            {
                "id": "loc-canteen",
                "name": "NIE Food Court",
                "campus": "NIE North Campus",
                "zone": "Amenities",
                "building": "Food Court",
                "floor": "Ground Floor",
                "room": "Seating Area",
                "latitude": 12.3728602,
                "longitude": 76.5856585,
                "location_type": "CANTEEN",
                "has_collection_desk": False
            },
            {
                "id": "loc-admin-desk",
                "name": "NIE Central Lost & Found Office",
                "campus": "NIE North Campus",
                "zone": "Administrative Zone",
                "building": "MB Block Admin Area",
                "floor": "Ground Floor",
                "room": "Room MB-02 (Proctor Desk)",
                "latitude": 12.3713084,
                "longitude": 76.5869772,
                "location_type": "ADMIN_OFFICE",
                "has_collection_desk": True
            },
            {
                "id": "loc-security-gate",
                "name": "Gopi's Canteen & Entrance Gate",
                "campus": "NIE North Campus",
                "zone": "Security Perimeter",
                "building": "Main Entrance",
                "floor": "Ground Floor",
                "room": "Security Post 1",
                "latitude": 12.3708848,
                "longitude": 76.5866563,
                "location_type": "SECURITY_DESK",
                "has_collection_desk": True
            },
            {
                "id": "loc-parking",
                "name": "Bike parking & BUS Parking Area",
                "campus": "NIE North Campus",
                "zone": "Parking Zone",
                "building": "West Parking Area",
                "floor": "Ground",
                "room": "Parking Bay",
                "latitude": 12.3709215,
                "longitude": 76.5845615,
                "location_type": "PARKING",
                "has_collection_desk": False
            }
        ]

        for loc_d in locations_data:
            loc = CampusLocation(**loc_d)
            db.add(loc)
        db.commit()

        # 2. Seed Users & Profiles
        print("👥 Seeding Demo Student & Proctor Users...")
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

        students_data = [
            {
                "id": "std-1",
                "email": "rahul.nie@nie.ac.in",
                "name": "Rahul Sharma",
                "usn": "4NI21CS089",
                "branch": "Computer Science & Engineering",
                "semester": 5,
                "section": "B",
                "points": 240,
                "recovered": 3,
                "streak": 14,
                "badge": "Campus Guardian Lv. 2 (Silver)"
            },
            {
                "id": "std-2",
                "email": "ananya.nie@nie.ac.in",
                "name": "Ananya Rao",
                "usn": "4NI22IS015",
                "branch": "Information Science & Engineering",
                "semester": 4,
                "section": "A",
                "points": 380,
                "recovered": 5,
                "streak": 21,
                "badge": "Campus Guardian Veteran (Master)"
            },
            {
                "id": "std-3",
                "email": "karthik.nie@nie.ac.in",
                "name": "Karthik Gowda",
                "usn": "4NI21EC045",
                "branch": "Electronics & Communication",
                "semester": 6,
                "section": "C",
                "points": 180,
                "recovered": 2,
                "streak": 7,
                "badge": "Campus Guardian Lv. 2 (Bronze)"
            },
            {
                "id": "std-4",
                "email": "sneha.nie@nie.ac.in",
                "name": "Sneha Patel",
                "usn": "4NI23AI032",
                "branch": "Artificial Intelligence & Data Science",
                "semester": 3,
                "section": "A",
                "points": 95,
                "recovered": 1,
                "streak": 3,
                "badge": "Campus Guardian Lv. 1"
            },
            {
                "id": "std-5",
                "email": "zayan@nie.ac.in",
                "name": "Zayan Ahmed",
                "usn": "4NI22CS155",
                "branch": "Computer Science & Engineering",
                "semester": 5,
                "section": "A",
                "points": 310,
                "recovered": 4,
                "streak": 18,
                "badge": "Campus Guardian Lv. 3 (Gold)"
            }
        ]

        for s in students_data:
            u = User(
                id=s["id"],
                email=s["email"],
                password_hash=hash_password("Student@123"),
                role="student",
                status="active",
                full_name=s["name"],
                phone="+91 98860 12345",
                avatar_url=f"https://api.dicebear.com/7.x/avataaars/svg?seed={s['usn']}"
            )
            db.add(u)
            sp = StudentProfile(
                user_id=s["id"],
                usn=s["usn"],
                college_email=s["email"],
                campus="NIE North Campus",
                branch=s["branch"],
                semester=s["semester"],
                section=s["section"],
                points_balance=s["points"],
                recovered_count=s["recovered"],
                streak_days=s["streak"],
                badge_level=s["badge"]
            )
            db.add(sp)

        db.commit()

        # 3. Seed Lost & Found Reports
        print("📦 Seeding Demo Reports & Photos...")
        reports_data = [
            {
                "id": "rep-lost-1",
                "type": "LOST",
                "title": "HP Pavilion Laptop (Silver, Intel Core i7)",
                "category": "ELECTRONICS",
                "description": "Silver HP Pavilion 15-inch laptop inside a dark grey sleeve. Has a blue GitHub octocat sticker on the lid and small scratch on bottom left corner.",
                "incident_place": "SB Block (Computing & AI Labs)",
                "current_location": "Lost in Lab",
                "place_id": "loc-sb-block",
                "event_date": "2026-09-25",
                "event_time": "14:30",
                "brand": "HP",
                "model": "Pavilion 15",
                "color": "Silver",
                "distinguishing_marks": "Blue GitHub octocat sticker on top right corner",
                "secret_clue": "GitHub sticker and Intel EVO emblem on bottom right",
                "status": "MATCHED",
                "reporter_id": "std-1",
                "reporter_name": "Rahul Sharma",
                "reporter_usn": "4NI21CS089",
                "image_url": "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600"
            },
            {
                "id": "rep-found-1",
                "type": "FOUND",
                "title": "HP Silver Laptop found in CS Lab 4",
                "category": "ELECTRONICS",
                "description": "Found a silver HP laptop left behind at Workstation 12 in CS Lab 4 after afternoon lab session. Kept safely at NIE Security Desk.",
                "incident_place": "SB Block (Computing & AI Labs)",
                "current_location": "Main Gate 1 Security Desk Locker #4",
                "place_id": "loc-sb-block",
                "event_date": "2026-09-25",
                "event_time": "16:45",
                "brand": "HP",
                "model": "Pavilion",
                "color": "Silver",
                "distinguishing_marks": "Octocat sticker on lid",
                "secret_clue": "GitHub sticker on lid",
                "status": "MATCHED",
                "reporter_id": "std-2",
                "reporter_name": "Ananya Rao",
                "reporter_usn": "4NI22IS015",
                "image_url": "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600"
            },
            {
                "id": "rep-lost-2",
                "type": "LOST",
                "title": "Casio Scientific Calculator fx-991EX",
                "category": "CALCULATORS",
                "description": "Black and white Casio fx-991EX ClassWiz scientific calculator. Has USN 4NI21EC045 lightly engraved with pencil on the back battery cover.",
                "incident_place": "Sir MV Block (Main Academic Block)",
                "current_location": "Lost in Classroom",
                "place_id": "loc-mv-block",
                "event_date": "2026-09-26",
                "event_time": "11:15",
                "brand": "Casio",
                "model": "fx-991EX ClassWiz",
                "color": "Black & White",
                "distinguishing_marks": "Engraved USN on battery cover",
                "secret_clue": "USN 4NI21EC045 on battery cover",
                "status": "VERIFICATION_PENDING",
                "reporter_id": "std-3",
                "reporter_name": "Karthik Gowda",
                "reporter_usn": "4NI21EC045",
                "image_url": "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=600"
            },
            {
                "id": "rep-found-2",
                "type": "FOUND",
                "title": "Casio ClassWiz Calculator in MB-204",
                "category": "CALCULATORS",
                "description": "Found on the 3rd bench in MB-204 after Maths lecture. In good working condition.",
                "incident_place": "Sir MV Block (Main Academic Block)",
                "current_location": "NIE Central Lost & Found Office",
                "place_id": "loc-mv-block",
                "event_date": "2026-09-26",
                "event_time": "12:30",
                "brand": "Casio",
                "model": "fx-991EX",
                "color": "Black & White",
                "distinguishing_marks": "Pencil marking on back",
                "secret_clue": "Pencil marking with USN on back",
                "status": "VERIFICATION_PENDING",
                "reporter_id": "std-5",
                "reporter_name": "Zayan Ahmed",
                "reporter_usn": "4NI22CS155",
                "image_url": "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=600"
            },
            {
                "id": "rep-lost-3",
                "type": "LOST",
                "title": "Noise ColorFit Pulse 2 Smartwatch (Black)",
                "category": "ACCESSORIES",
                "description": "Black silicone strap smartwatch with magnetic charging pins on the underside. Screen has a tiny scratch on the top edge.",
                "incident_place": "Central Digital Library",
                "current_location": "Lost in Library",
                "place_id": "loc-library",
                "event_date": "2026-09-24",
                "event_time": "17:00",
                "brand": "Noise",
                "model": "ColorFit Pulse 2",
                "color": "Black",
                "distinguishing_marks": "Custom yellow digital watch face",
                "secret_clue": "Custom yellow digital watch face with daily step goal 8000",
                "status": "ACTIVE",
                "reporter_id": "std-4",
                "reporter_name": "Sneha Patel",
                "reporter_usn": "4NI23AI032",
                "image_url": "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600"
            }
        ]

        for r_d in reports_data:
            text_context = f"{r_d['title']} {r_d['category']} {r_d['description']} {r_d['incident_place']} {r_d['brand']} {r_d['color']}"
            text_emb = embedding_provider.generate_text_embedding(text_context)
            img_emb = embedding_provider.generate_image_embedding(r_d["image_url"])

            rep = ItemReport(
                id=r_d["id"],
                report_type=r_d["type"],
                title=r_d["title"],
                category=r_d["category"],
                description=r_d["description"],
                incident_place=r_d["incident_place"],
                current_location=r_d["current_location"],
                place_id=r_d["place_id"],
                event_date=r_d["event_date"],
                event_time=r_d["event_time"],
                brand=r_d["brand"],
                model=r_d["model"],
                color=r_d["color"],
                distinguishing_marks=r_d["distinguishing_marks"],
                secret_verification_clue=r_d["secret_clue"],
                status=r_d["status"],
                reward_points_eligible=50,
                is_anonymous=False,
                reporter_id=r_d["reporter_id"],
                reporter_name=r_d["reporter_name"],
                reporter_usn=r_d["reporter_usn"],
                text_embedding=json.dumps(text_emb),
                image_embedding=json.dumps(img_emb)
            )
            db.add(rep)

            # Image
            img = ItemImage(
                id=f"img-{r_d['id']}",
                report_id=r_d["id"],
                storage_path=r_d["image_url"],
                url=r_d["image_url"],
                source_type="USER_UPLOADED",
                is_primary=True,
                mime_type="image/jpeg",
                file_size=245000,
                width=800,
                height=600
            )
            db.add(img)

        db.commit()

        # 4. Seed Matches
        print("🎯 Seeding Potential Matches with Multi-Signal Breakdowns...")
        match1 = PotentialMatch(
            id="mat-hp-laptop",
            lost_report_id="rep-lost-1",
            found_report_id="rep-found-1",
            similarity_score=0.94,
            visual_score=0.92,
            text_score=0.95,
            location_score=1.0,
            time_score=0.88,
            category_score=1.0,
            attribute_score=0.95,
            reasons_json=json.dumps([
                "High visual similarity (Silver casing with octocat sticker)",
                "Same campus location: SB Block (Computing & AI Labs)",
                "Reported within 3 hours on September 25",
                "Matching brand (HP) and item category"
            ]),
            match_clues_json=json.dumps([
                "Found in CS Lab 4 with distinct lid sticker",
                "Matches silver 15-inch Pavilion profile"
            ]),
            status="PENDING_REVIEW"
        )
        db.add(match1)

        match2 = PotentialMatch(
            id="mat-casio-calc",
            lost_report_id="rep-lost-2",
            found_report_id="rep-found-2",
            similarity_score=0.89,
            visual_score=0.85,
            text_score=0.90,
            location_score=1.0,
            time_score=0.95,
            category_score=1.0,
            attribute_score=0.90,
            reasons_json=json.dumps([
                "Exact matching model (Casio fx-991EX ClassWiz)",
                "Same classroom area (Sir MV Block MB-204)",
                "Reported within 1.5 hours on September 26"
            ]),
            match_clues_json=json.dumps([
                "Casio ClassWiz found in MB-204",
                "Matching color scheme and model"
            ]),
            status="VERIFICATION_REQUESTED"
        )
        db.add(match2)
        db.commit()

        # 5. Seed Verification Cases
        print("🔒 Seeding Ownership Verification Case...")
        case1 = VerificationCase(
            id="case-calc-8921",
            match_id="mat-casio-calc",
            lost_report_id="rep-lost-2",
            found_report_id="rep-found-2",
            claimant_id="std-3",
            finder_id="std-5",
            status="AWAITING_CLAIMANT",
            confidence_rating="High",
            attempts_count=0,
            max_attempts=3,
            handover_otp="849201",
            handover_location="NIE Central Lost & Found Office (Admin Block Ground Floor)"
        )
        db.add(case1)

        q1 = VerificationQuestion(
            id="q-calc-1",
            case_id="case-calc-8921",
            question="What specific identifier, USN, or pencil marking is present on the back battery cover of the calculator?",
            expected_answer_normalized="4ni21ec045",
            is_verified=False
        )
        db.add(q1)
        db.commit()

        # 6. Seed Rewards & Milestones
        print("🏆 Seeding Badges & Recovery Milestones...")
        m1 = Milestone(
            id="ms-zayan-1",
            user_id="std-5",
            title="First Successful Campus Recovery Certificate",
            badge_code="GUARDIAN_INITIATE",
            description="Official recognition for honest item return at NIE Mysore.",
            certificate_number="NIE-LF-2026-92841A",
            achieved_at=datetime.now(timezone.utc) - timedelta(days=12)
        )
        db.add(m1)

        tx1 = RewardTransaction(
            id="tx-seed-1",
            user_id="std-5",
            case_id="case-calc-8921",
            points=75,
            reason="Verified return & handover of Casio Calculator",
            badge_awarded="Good Samaritan"
        )
        db.add(tx1)

        # 7. Seed Notifications
        print("🔔 Seeding In-App Notifications...")
        n1 = Notification(
            id="notif-1",
            user_id="std-1",
            type="MATCH_FOUND",
            title="Match Radar: HP Laptop Found at SB Block",
            body="A found HP Pavilion Laptop matches your lost report with 94% similarity. Click to verify ownership.",
            related_case_id="mat-hp-laptop",
            link_url="/student/matches/mat-hp-laptop",
            read=False
        )
        db.add(n1)

        n2 = Notification(
            id="notif-2",
            user_id="std-3",
            type="VERIFICATION",
            title="Ownership Verification Ready",
            body="Your Casio Calculator match is ready for ownership verification questions.",
            related_case_id="case-calc-8921",
            link_url="/student/verification/case-calc-8921",
            read=False
        )
        db.add(n2)

        # 8. Seed Audit Log
        print("📜 Seeding Security Audit Logs...")
        aud1 = AuditLog(
            id="aud-init-1",
            actor_id="std-1",
            actor_name="Rahul Sharma",
            actor_role="student",
            event_type="REPORT_CREATED",
            case_id="rep-lost-1",
            status="SUCCESS",
            description="Lost report created: HP Pavilion Laptop at SB Block",
            metadata_json=json.dumps({"category": "ELECTRONICS", "brand": "HP"})
        )
        db.add(aud1)

        aud2 = AuditLog(
            id="aud-init-2",
            actor_id="SYSTEM",
            actor_name="SAHAYAK Match Radar Engine",
            actor_role="SYSTEM",
            event_type="MATCH_GENERATED",
            case_id="mat-hp-laptop",
            status="SUCCESS",
            description="Match generated between rep-lost-1 and rep-found-1 (Score: 0.94)",
            metadata_json=json.dumps({"similarity_score": 0.94})
        )
        db.add(aud2)

        db.commit()
        print("✅ SAHAYAK Database Seeding Completed Successfully!")

    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding database: {e}", file=sys.stderr)
        raise e
    finally:
        if close_at_end:
            db.close()


if __name__ == "__main__":
    seed()
