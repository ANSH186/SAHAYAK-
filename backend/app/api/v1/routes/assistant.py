from fastapi import APIRouter, Depends
from app.schemas.assistant import AssistantChatRequest, AssistantChatResponse, DescribeFactsRequest, DescribeFactsResponse
from app.services.assistant_service import AssistantService
from app.utils.formatters import api_response

router = APIRouter(prefix="/assistant", tags=["AI Assistant"])


@router.post("/chat", summary="Chat with SAHAYAK Campus Lost & Found Assistant")
def chat(req: AssistantChatRequest):
    svc = AssistantService()
    reply = svc.chat(req.message, req.context)
    return api_response({
        "reply": reply,
        "suggestedActions": [
            "Report Lost Item",
            "Report Found Item",
            "Check Match Radar",
            "How Verification Works"
        ]
    })


@router.post("/describe", summary="Clean and enhance item description strictly from provided user facts")
def describe(req: DescribeFactsRequest):
    svc = AssistantService()
    result = svc.describe(req)
    return api_response(result.model_dump())
