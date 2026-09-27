from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from app.schemas.reports import ReportResponse


class MatchSignalsBreakdown(BaseModel):
    categoryMatch: bool = True
    imageSimilarity: float = 0.0
    imageSimilarityScore: float = 0.0
    textSimilarity: float = 0.0
    textSimilarityScore: float = 0.0
    locationScore: float = 0.0
    locationProximityScore: float = 0.0
    timeScore: float = 0.0
    timeProximityScore: float = 0.0
    attributeMatchScore: float = 0.0
    reasons: List[str] = []


class MatchResponse(BaseModel):
    id: str
    lost_report_id: str
    found_report_id: str
    similarityScore: float
    similarity_score: Optional[float] = None
    signals: MatchSignalsBreakdown
    status: str
    lostReport: Optional[ReportResponse] = None
    foundReport: Optional[ReportResponse] = None
    matchClues: List[str] = []
    suggestedAt: Optional[str] = None
    created_at: Optional[datetime] = None
