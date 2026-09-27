from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Form, Query, HTTPException, status
from pydantic import BaseModel

from app.vision.services.pipeline import get_vision_pipeline
from app.vision.services.matcher import get_matching_engine
from app.vision.schemas.features import ImageProcessingResponse, ProcessedItem
from app.vision.schemas.comparison import ComparisonResult, CandidatePayload, MultiMatchResponse, RankedMatch
from app.vision.core.config import vision_settings
from app.vision.core.device import get_device

router = APIRouter(prefix="/vision", tags=["AI Vision & Machine Learning"])


@router.get("/models", summary="Inspect AI Vision Model Metadata & Thresholds")
async def get_model_metadata():
    """Returns information on YOLOv8, OpenCLIP, OpenCV ORB, and fusion weights."""
    return {
        "status": "active",
        "device": get_device(),
        "models": {
            "object_detector": {
                "name": vision_settings.YOLO_MODEL_NAME,
                "framework": "Ultralytics YOLOv8",
                "confidence_threshold": vision_settings.YOLO_CONFIDENCE_THRESHOLD,
            },
            "semantic_embedder": {
                "name": vision_settings.CLIP_MODEL_NAME,
                "weights": vision_settings.CLIP_PRETRAINED,
                "dimension": 512,
                "normalization": "L2"
            },
            "instance_keypoints": {
                "algorithm": "OpenCV ORB + RANSAC",
                "max_features": vision_settings.ORB_MAX_FEATURES,
                "lowe_ratio": vision_settings.LOWE_RATIO_THRESHOLD
            },
            "perceptual_hashes": {
                "types": ["pHash", "dHash", "aHash"],
                "distance_metric": "Hamming"
            }
        },
        "fusion_weights": {
            "clip_semantic": vision_settings.WEIGHT_CLIP,
            "perceptual_hash": vision_settings.WEIGHT_HASH,
            "orb_inliers": vision_settings.WEIGHT_ORB,
            "category_match": vision_settings.WEIGHT_CATEGORY
        },
        "decision_thresholds": {
            "match": vision_settings.HIGH_CONFIDENCE_THRESHOLD,
            "possible_match": vision_settings.SIMILARITY_MATCH_THRESHOLD
        }
    }


@router.post("/process", response_model=ImageProcessingResponse, summary="Extract AI Visual Features from Item Photo")
async def process_image(
    image: UploadFile = File(..., description="Item photograph (JPEG/PNG)"),
    compact: bool = Query(False, description="Omit raw binary descriptors for lighter payload")
):
    """
    Executes the full AI Vision pipeline:
    1. YOLOv8 object detection & campus category mapping
    2. Boundary-safe bounding box cropping
    3. Perceptual hashing (pHash, dHash, aHash)
    4. OpenCV ORB local keypoints extraction
    5. OpenCLIP 512-D L2-normalized visual embedding
    """
    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Uploaded image file is empty."
        )

    pipeline = get_vision_pipeline()
    try:
        response = pipeline.process_image(
            image_bytes=image_bytes,
            filename=image.filename,
            compact=compact
        )
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Image processing failed: {str(e)}"
        )


@router.post("/compare", response_model=ComparisonResult, summary="Compare Two Images with Multi-Signal Visual AI")
async def compare_images(
    image_a: UploadFile = File(..., description="First image (e.g. Lost item)"),
    image_b: UploadFile = File(..., description="Second image (e.g. Found item)")
):
    """
    Computes direct multi-signal visual similarity between two photographs:
    CLIP Cosine + pHash/dHash/aHash + ORB RANSAC + Category Match.
    """
    bytes_a = await image_a.read()
    bytes_b = await image_b.read()

    pipeline = get_vision_pipeline()
    matcher = get_matching_engine()

    try:
        res_a = pipeline.process_image(bytes_a, filename=image_a.filename)
        res_b = pipeline.process_image(bytes_b, filename=image_b.filename)

        if not res_a.items or not res_b.items:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Unable to isolate items in one or both provided images."
            )

        item_a = res_a.items[0]
        item_b = res_b.items[0]

        return matcher.compare_items(item_a, item_b)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Comparison failed: {str(e)}"
        )


class MatchCandidatesRequest(BaseModel):
    query_item: ProcessedItem
    candidates: List[CandidatePayload]


@router.post("/match", response_model=MultiMatchResponse, summary="Match Query Image Features against Candidate Database")
async def match_candidates(payload: MatchCandidatesRequest):
    """
    Ranks a list of candidate items against a query item using multi-signal visual similarity.
    """
    matcher = get_matching_engine()
    ranked = matcher.rank_candidates(payload.query_item, payload.candidates)
    return MultiMatchResponse(
        query_category=payload.query_item.detection.category,
        matches=ranked
    )
