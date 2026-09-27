import logging
from typing import List, Optional
import numpy as np
from PIL import Image

from app.vision.core.config import vision_settings
from app.vision.core.device import get_device
from app.vision.schemas.detection import BoundingBox, DetectionResult

logger = logging.getLogger("sahayak.vision.detector")

# Category mapping from COCO / typical YOLO classes to campus categories
COCO_CAMPUS_MAP = {
    "backpack": "Bags & Backpacks",
    "handbag": "Bags & Backpacks",
    "suitcase": "Bags & Backpacks",
    "cell phone": "Electronics",
    "laptop": "Electronics",
    "mouse": "Electronics",
    "keyboard": "Electronics",
    "tv": "Electronics",
    "remote": "Electronics",
    "bottle": "Bottles & Flasks",
    "cup": "Bottles & Flasks",
    "book": "Documents & Books",
    "umbrella": "Personal Accessories",
    "watch": "Personal Accessories",
    "glasses": "Personal Accessories",
    "scissors": "Stationery",
    "sports ball": "Sports Equipment",
}


class ObjectDetector:
    """YOLOv8 object detector with safe fallback mechanism."""
    def __init__(self, model_name: str = vision_settings.YOLO_MODEL_NAME):
        self.model_name = model_name
        self.device = get_device()
        self.model = None
        self._load_model()

    def _load_model(self):
        try:
            from ultralytics import YOLO
            self.model = YOLO(self.model_name)
            logger.info(f"Loaded YOLO model: {self.model_name} on {self.device}")
        except Exception as e:
            logger.warning(f"YOLO model load deferred or using fallback: {e}")
            self.model = None

    def detect(self, cv2_img: np.ndarray) -> List[DetectionResult]:
        h, w = cv2_img.shape[:2]
        
        if self.model is not None:
            try:
                results = self.model.predict(
                    source=cv2_img,
                    conf=vision_settings.YOLO_CONFIDENCE_THRESHOLD,
                    device=self.device,
                    verbose=False
                )
                
                detections: List[DetectionResult] = []
                for r in results:
                    boxes = r.boxes
                    for box in boxes:
                        cls_id = int(box.cls[0].item())
                        cls_name = r.names.get(cls_id, "object")
                        conf = float(box.conf[0].item())
                        xyxy = box.xyxy[0].tolist()

                        # Normalize coords to [0, 1]
                        xmin = max(0.0, min(1.0, xyxy[0] / w))
                        ymin = max(0.0, min(1.0, xyxy[1] / h))
                        xmax = max(0.0, min(1.0, xyxy[2] / w))
                        ymax = max(0.0, min(1.0, xyxy[3] / h))

                        category = COCO_CAMPUS_MAP.get(cls_name.lower(), "Personal Accessories")

                        detections.append(DetectionResult(
                            category=category,
                            confidence=conf,
                            bbox=BoundingBox(xmin=xmin, ymin=ymin, xmax=xmax, ymax=ymax),
                            is_fallback=False,
                            raw_class_name=cls_name
                        ))

                if detections:
                    # Sort by confidence descending
                    detections.sort(key=lambda d: d.confidence, reverse=True)
                    return detections
            except Exception as e:
                logger.error(f"YOLO inference error: {e}")

        # Fallback: Whole image bounding box
        return [DetectionResult(
            category="Other / General",
            confidence=1.0,
            bbox=BoundingBox(xmin=0.0, ymin=0.0, xmax=1.0, ymax=1.0),
            is_fallback=True,
            raw_class_name="full_image"
        )]
