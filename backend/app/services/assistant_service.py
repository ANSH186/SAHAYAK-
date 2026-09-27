from typing import Any, Dict, List, Optional
from app.integrations.ai import get_ai_provider
from app.schemas.assistant import DescribeFactsRequest, DescribeFactsResponse


class AssistantService:
    def __init__(self):
        self.ai = get_ai_provider()

    def chat(self, message: str, context: Optional[Dict[str, Any]] = None) -> str:
        return self.ai.chat(message, context)

    def describe(self, req: DescribeFactsRequest) -> DescribeFactsResponse:
        facts = {
            "title": req.title,
            "category": req.category,
            "color": req.color,
            "brand": req.brand,
            "model": req.model,
            "incidentPlace": req.incidentPlace,
            "distinguishingMarks": req.distinguishingMarks
        }
        res = self.ai.generate_description(facts)
        return DescribeFactsResponse(
            enhanced_title=res["enhanced_title"],
            enhanced_description=res["enhanced_description"],
            extracted_keywords=res.get("extracted_keywords", []),
            is_mock=res.get("is_mock", True)
        )
