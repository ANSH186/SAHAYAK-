from fastapi import APIRouter
from app.api.v1.routes import (
    health,
    auth,
    users,
    reports,
    matches,
    verification,
    messages,
    handover,
    recovery,
    rewards,
    notifications,
    locations,
    admin,
    assistant,
    vision
)

api_router = APIRouter()

api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(reports.router)
api_router.include_router(matches.router)
api_router.include_router(verification.router)
api_router.include_router(messages.router)
api_router.include_router(handover.router)
api_router.include_router(recovery.router)
api_router.include_router(rewards.router)
api_router.include_router(notifications.router)
api_router.include_router(locations.router)
api_router.include_router(admin.router)
api_router.include_router(assistant.router)
api_router.include_router(vision.router)

# Also expose /ai/describe directly for exact endpoint matching
ai_direct_router = APIRouter(prefix="/ai", tags=["AI & Vision"])
ai_direct_router.add_api_route("/describe", assistant.describe, methods=["POST"], summary="Clean item description from user facts")
api_router.include_router(ai_direct_router)
