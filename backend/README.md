# SAHAYAK Backend — Intelligent Campus Lost & Found Platform

**National Institute of Engineering (NIE), Mysuru**  
Production-ready FastAPI backend powering the SAHAYAK Lost & Found ecosystem.

---

## 🏛 Architecture & Tech Stack

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+) with Pydantic v2 validation.
- **Database ORM**: [SQLAlchemy 2.0](https://www.sqlalchemy.org/) with PostgreSQL / PostGIS support and local SQLite fallback.
- **Migrations**: [Alembic](https://alembic.sqlalchemy.org/) for declarative, production-grade schema migrations.
- **Authentication**: JWT (HS256) bearer token auth with role-based access control (`student`, `admin`, `proctor`, `authorized_reviewer`).
- **AI & Computer Vision**: Modular provider abstraction (`AIProvider`, `VisionProvider`, `EmbeddingProvider`) supporting pluggable Gemini / OpenAI / SentenceTransformers and deterministic mock providers.
- **Storage**: Pluggable storage abstraction supporting local file storage, Supabase Storage, and AWS S3.
- **Geospatial Engine**: PostGIS distance calculation and Haversine formula proximity scoring for NIE North campus zones and buildings.

---

## 🚀 Quickstart & Local Setup

### 1. Environment Configuration

```bash
cd backend
cp .env.example .env
```

### 2. Install Dependencies

```bash
# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install requirements
pip install -r requirements.txt
```

### 3. Run Migrations & Seed Data

```bash
# Apply database schema migrations
alembic upgrade head

# Seed NIE North campus data (locations, demo students, reports, matches, cases)
python seed_data.py
```

### 4. Start the FastAPI Server

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at:
- **API Base**: `http://localhost:8000/api/v1`
- **Interactive OpenAPI Docs**: `http://localhost:8000/docs`
- **Alternative ReDoc**: `http://localhost:8000/redoc`

---

## 🧪 Running Tests

The test suite covers authentication, report creation, state machine transitions, matching engine, verification security, handovers, rewards, admin RBAC, and AI assistance:

```bash
cd backend
pytest -v
```

---

## 📡 API Modules Overview

| Route Prefix | Description | Auth Required |
|---|---|---|
| `/api/v1/health` | Service & database connectivity health check | No |
| `/api/v1/auth` | Student registration, student/admin login, profile retrieval | No / Bearer |
| `/api/v1/users` | User and student academic profile management | Bearer |
| `/api/v1/reports` | Lost & Found report creation, image uploads, lifecycle state transitions | Public / Bearer |
| `/api/v1/matches` | Multi-signal similarity radar and match diagnostics | Public / Bearer |
| `/api/v1/verification` | Ownership verification case initiation, attempt rate-limiting, proctor manual review | Bearer |
| `/api/v1/messages` | Case-based encrypted student-to-finder conversations | Bearer |
| `/api/v1/handover` | Campus collection desk scheduling and return confirmation | Bearer |
| `/api/v1/recovery` | Complete case recovery lifecycle tracking | Bearer |
| `/api/v1/rewards` | Good Samaritan points balance, transactions, leaderboard, certificates | Public / Bearer |
| `/api/v1/notifications`| User alerts for matches, verification, handover, and return | Bearer |
| `/api/v1/locations` | NIE North campus buildings, collection desks, and heatmap density | No |
| `/api/v1/admin` | Proctor dashboard metrics, audit logs, cases, and resolution analytics | Admin/Proctor |
| `/api/v1/assistant` | AI FAQ guidance chatbot and structured description assistant | No |

---

## 🔒 Security & Data Integrity

1. **Deterministic Verification**: Ownership verification relies on server-side deterministic comparison against protected clues with attempt limiting (max 3) and routing to proctor manual review.
2. **State Machine Enforcement**: Report statuses follow explicit transition graphs (`ACTIVE -> MATCHED -> VERIFICATION_PENDING -> VERIFIED -> HANDOVER_SCHEDULED -> HANDOVER_CONFIRMED -> RETURNED`).
3. **Auditing**: Every critical event (report creation, verification attempt, handover, reward point award) creates an immutable record in `audit_logs` with credential redaction.
4. **Secret Protection**: Protected verification clues, raw hashes, and passwords are never exposed through public API endpoints.

---

## 🐳 Docker Deployment

To spin up the backend with PostgreSQL/PostGIS and Redis:

```bash
docker-compose up --build
```
