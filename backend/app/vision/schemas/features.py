from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from app.vision.schemas.detection import DetectionResult


class ImageHashes(BaseModel):
    phash: str = Field(..., description="Perceptual hash (DCT based)")
    dhash: str = Field(..., description="Difference gradient hash")
    ahash: str = Field(..., description="Average hash")


class ORBFeatures(BaseModel):
    keypoint_count: int
    descriptors_b64: Optional[str] = None


class VisualEmbedding(BaseModel):
    model: str
    dimension: int
    vector: List[float]


class ProcessedItem(BaseModel):
    detection: DetectionResult
    hashes: ImageHashes
    orb: ORBFeatures
    embedding: VisualEmbedding
    description: Optional[str] = Field(None, description="Auto-generated semantic description of the detected object")
    color_distribution: Optional[Dict[str, float]] = Field(None, description="Dominant detected colors and their distribution")


class ImageProcessingResponse(BaseModel):
    success: bool = True
    filename: Optional[str] = None
    width: int
    height: int
    items: List[ProcessedItem]
    device: str
