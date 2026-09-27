from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class AssistantChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None


class AssistantChatResponse(BaseModel):
    reply: str
    suggestedActions: Optional[List[str]] = []


class DescribeFactsRequest(BaseModel):
    title: str
    category: str
    color: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    incidentPlace: Optional[str] = None
    distinguishingMarks: Optional[str] = None


class DescribeFactsResponse(BaseModel):
    enhanced_title: str
    enhanced_description: str
    extracted_keywords: List[str] = []
    is_mock: bool = True
