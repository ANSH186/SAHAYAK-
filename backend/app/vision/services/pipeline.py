import logging
from typing import Optional
from PIL import Image
import numpy as np

from app.vision.core.device import get_device
from app.vision.schemas.features import ProcessedItem, ImageProcessingResponse
from app.vision.services.detector import ObjectDetector
from app.vision.services.embedder import VisualEmbedder
from app.vision.services.visual_features import VisualFeatureExtractor
from app.vision.services.captioner import ImageCaptioner
from app.vision.utils.image_processing import decode_image_bytes, safe_crop, pil_from_cv2

logger = logging.getLogger("sahayak.vision.pipeline")


class VisionPipeline:
    """Unified vision processing pipeline."""
    def __init__(self):
        self.detector = ObjectDetector()
        self.embedder = VisualEmbedder()
        self.feature_extractor = VisualFeatureExtractor()
        self.device = get_device()

    def process_image(
        self,
        image_bytes: bytes,
        filename: Optional[str] = None,
        compact: bool = False
    ) -> ImageProcessingResponse:
        pil_img, cv2_img = decode_image_bytes(image_bytes)
        h, w = cv2_img.shape[:2]

        # 1. Detect objects with YOLO (or fallback to full image)
        detections = self.detector.detect(cv2_img)
        
        items = []
        for det in detections:
            # 2. Crop detected bounding box
            crop_cv2 = safe_crop(cv2_img, det.bbox)
            crop_pil = pil_from_cv2(crop_cv2)

            # 3. Extract perceptual hashes
            hashes = self.feature_extractor.extract_hashes(crop_pil)

            # 4. Extract ORB keypoints
            orb_feats, _ = self.feature_extractor.extract_orb(crop_cv2)
            if compact:
                orb_feats.descriptors_b64 = None  # Omit large descriptors if compact requested

            # 5. Extract OpenCLIP semantic embedding
            embedding = self.embedder.embed_image(crop_pil)

            # 6. Generate semantic physical description & color distribution
            description, colors = ImageCaptioner.generate_description(
                raw_class=det.raw_class_name,
                category=det.category,
                cv2_img=crop_cv2,
                confidence=det.confidence
            )

            items.append(ProcessedItem(
                detection=det,
                hashes=hashes,
                orb=orb_feats,
                embedding=embedding,
                description=description,
                color_distribution=colors
            ))

        return ImageProcessingResponse(
            success=True,
            filename=filename,
            width=w,
            height=h,
            items=items,
            device=self.device
        )


_pipeline_instance = None

def get_vision_pipeline() -> VisionPipeline:
    global _pipeline_instance
    if _pipeline_instance is None:
        _pipeline_instance = VisionPipeline()
    return _pipeline_instance
