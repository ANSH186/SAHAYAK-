import io
from typing import Tuple
import numpy as np
from PIL import Image
try:
    import cv2
    HAS_CV2 = True
except (ImportError, Exception):
    cv2 = None
    HAS_CV2 = False

from app.vision.core.exceptions import ImageDecodeError, InvalidImageFormatError
from app.vision.schemas.detection import BoundingBox


def decode_image_bytes(image_bytes: bytes) -> Tuple[Image.Image, np.ndarray]:
    """
    Safely decode raw image bytes into PIL Image (RGB) and OpenCV NumPy array (BGR).
    """
    if not image_bytes:
        raise ImageDecodeError("Empty image payload provided.")

    try:
        pil_img = Image.open(io.BytesIO(image_bytes))
        pil_img = pil_img.convert("RGB")
        
        rgb_arr = np.array(pil_img)
        if HAS_CV2 and cv2 is not None:
            cv2_img = cv2.cvtColor(rgb_arr, cv2.COLOR_RGB2BGR)
        else:
            cv2_img = rgb_arr
        
        return pil_img, cv2_img
    except Exception as e:
        raise ImageDecodeError(f"Failed to decode image: {str(e)}")


def safe_crop(cv2_img: np.ndarray, bbox: BoundingBox) -> np.ndarray:
    """
    Safely crop image based on normalized bounding box [0, 1].
    Guarantees bounds stay within image dimensions.
    """
    h, w = cv2_img.shape[:2]
    
    x1 = int(max(0, min(w - 1, bbox.xmin * w)))
    y1 = int(max(0, min(h - 1, bbox.ymin * h)))
    x2 = int(max(x1 + 1, min(w, bbox.xmax * w)))
    y2 = int(max(y1 + 1, min(h, bbox.ymax * h)))
    
    crop = cv2_img[y1:y2, x1:x2]
    if crop.size == 0:
        return cv2_img
    return crop


def pil_from_cv2(cv2_img: np.ndarray) -> Image.Image:
    """Convert OpenCV BGR array to PIL RGB Image."""
    if HAS_CV2 and cv2 is not None and len(cv2_img.shape) == 3 and cv2_img.shape[2] == 3:
        rgb = cv2.cvtColor(cv2_img, cv2.COLOR_BGR2RGB)
        return Image.fromarray(rgb)
    return Image.fromarray(cv2_img)
