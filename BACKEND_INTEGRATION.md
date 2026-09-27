# SAHAYAK Frontend-to-Backend Integration Guide

This document describes how the unified React frontend in `frontend/` connects to the FastAPI backend in `backend/`.

---

## 🔌 API Client Architecture

All backend communication flows through the typed API client located at:
[frontend/src/lib/api.ts](file:///run/media/zayan/Local%20Disk/SAHAYAK/frontend/src/lib/api.ts)

### Base URL Configuration
Configured via `.env` in `frontend/`:
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### Endpoints Integration Matrix

| Frontend Feature | Backend API Route | Status |
|---|---|---|
| **Student Login** | `POST /api/v1/auth/login` | Connected |
| **Admin Login** | `POST /api/v1/auth/admin/login` | Connected |
| **Registration** | `POST /api/v1/auth/register` | Connected |
| **Current User Profile** | `GET /api/v1/auth/me` | Connected |
| **Report Lost / Found** | `POST /api/v1/reports` | Connected |
| **Image Uploads** | `POST /api/v1/reports/{id}/images` | Connected |
| **Match Radar** | `GET /api/v1/matches` | Connected |
| **Match Details** | `GET /api/v1/matches/{id}` | Connected |
| **Ownership Verification** | `POST /api/v1/verification/initiate` | Connected |
| **Submit Clue Answers** | `POST /api/v1/verification/cases/{id}/answers` | Connected |
| **Case Messages** | `GET /api/v1/messages/{caseId}`, `POST /api/v1/messages` | Connected |
| **Handover Schedule** | `POST /api/v1/handover/schedule` | Connected |
| **Handover & Return Confirm** | `POST /api/v1/handover/confirm` | Connected |
| **Campus Leaderboard** | `GET /api/v1/rewards/leaderboard` | Connected |
| **Digital Certificates** | `GET /api/v1/rewards/certificate/{id}` | Connected |
| **Campus Heatmap** | `GET /api/v1/locations/heatmap` | Connected |
| **Admin Analytics** | `GET /api/v1/admin/dashboard`, `GET /api/v1/admin/resolution` | Connected |
| **AI Description Assistant** | `POST /api/v1/ai/describe` | Connected |
| **AI FAQ Chatbot** | `POST /api/v1/assistant/chat` | Connected |

---

## 🏃‍♂️ Running the Full Stack

You can run both the frontend and backend simultaneously:

### Terminal 1: Backend (Port 8000)
```bash
npm run backend
# Or directly:
cd backend && ./.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Terminal 2: Frontend (Port 5173)
```bash
npm run dev
```

### Seed Data
```bash
npm run backend:seed
```

### Test Suite
```bash
npm run backend:test
```
