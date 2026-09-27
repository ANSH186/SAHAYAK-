from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class AuditEventResponse(BaseModel):
    id: str
    timestamp: str
    eventType: str
    actor: Optional[str] = None
    actorName: Optional[str] = None
    actorRole: Optional[str] = None
    caseId: Optional[str] = None
    status: str
    description: str


class AdminDashboardMetrics(BaseModel):
    totalReports: int
    lostCount: int
    foundCount: int
    activeCases: int
    matchedCount: int
    verifiedRecoveries: int
    manualReviewPending: int
    averageResolutionDays: float
    totalRewardPointsDistributed: int
    recoveryRatePercentage: float
    monthlyTrend: List[Dict[str, Any]] = []
