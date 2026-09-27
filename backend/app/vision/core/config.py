from pydantic_settings import BaseSettings
from typing import List, Optional


class VisionSettings(BaseSettings):
    YOLO_MODEL_NAME: str = "yolov8n.pt"
    CLIP_MODEL_NAME: str = "ViT-B-32"
    CLIP_PRETRAINED: str = "laion2b_s34b_b79k"
    YOLO_CONFIDENCE_THRESHOLD: float = 0.25
    ORB_MAX_FEATURES: int = 500
    RANSAC_REPROJ_THRESHOLD: float = 3.0
    LOWE_RATIO_THRESHOLD: float = 0.75
    SIMILARITY_MATCH_THRESHOLD: float = 0.65
    HIGH_CONFIDENCE_THRESHOLD: float = 0.85
    
    # Matching weight distribution
    WEIGHT_CLIP: float = 0.50
    WEIGHT_HASH: float = 0.20
    WEIGHT_ORB: float = 0.20
    WEIGHT_CATEGORY: float = 0.10

    class Config:
        env_prefix = "VISION_"
        extra = "ignore"


vision_settings = VisionSettings()
