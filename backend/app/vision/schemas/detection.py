from typing import List, Optional
from pydantic import BaseModel, Field


class BoundingBox(BaseModel):
    xmin: float = Field(..., description="Normalized left coordinate [0, 1]")
    ymin: float = Field(..., description="Normalized top coordinate [0, 1]")
    xmax: float = Field(..., description="Normalized right coordinate [0, 1]")
    ymax: float = Field(..., description="Normalized bottom coordinate [0, 1]")
    width: Optional[float] = None
    height: Optional[float] = None

    def model_post_init(self, __context):
        if self.width is None:
            self.width = max(0.0, self.xmax - self.xmin)
        if self.height is None:
            self.height = max(0.0, self.ymax - self.ymin)


class DetectionResult(BaseModel):
    category: str
    confidence: float
    bbox: BoundingBox
    is_fallback: bool = False
    raw_class_name: Optional[str] = None
