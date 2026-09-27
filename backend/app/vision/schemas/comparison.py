from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from app.vision.schemas.features import ProcessedItem


class MatchSignals(BaseModel):
    clip_similarity: float
    description_similarity: float = Field(0.0, description="Semantic cosine similarity between generated item descriptions")
    hash_similarity: float
    orb_inliers_score: float
    category_match: float
    class_penalty: float = Field(0.0, description="Negative penalty score applied if items belong to incompatible classes")
    overall_confidence: float


class ComparisonResult(BaseModel):
    match: bool
    confidence: float
    verdict: str  # "MATCH", "POSSIBLE_MATCH", "NO_MATCH", "CLASS_MISMATCH_PENALTY"
    description_a: Optional[str] = Field(None, description="Auto-generated semantic description for Item A")
    description_b: Optional[str] = Field(None, description="Auto-generated semantic description for Item B")
    class_compatible: bool = Field(True, description="Whether both items belong to compatible object classes")
    signals: MatchSignals
    reasons: List[str]


class CandidatePayload(BaseModel):
    id: str
    title: str
    category: str
    features: ProcessedItem


class RankedMatch(BaseModel):
    candidate_id: str
    title: str
    confidence: float
    verdict: str
    signals: MatchSignals
    reasons: List[str]


class MultiMatchResponse(BaseModel):
    query_category: str
    matches: List[RankedMatch]
