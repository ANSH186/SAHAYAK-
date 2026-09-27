try:
    import cv2
    HAS_CV2 = True
except (ImportError, Exception):
    cv2 = None
    HAS_CV2 = False

try:
    import imagehash
    HAS_IMAGEHASH = True
except (ImportError, Exception):
    imagehash = None
    HAS_IMAGEHASH = False

import hashlib
import numpy as np
from PIL import Image
from typing import Tuple, Optional

from app.vision.schemas.features import ImageHashes, ORBFeatures
from app.vision.utils.serialization import pack_descriptors, unpack_descriptors
from app.vision.core.config import vision_settings


class VisualFeatureExtractor:
    """Extracts perceptual hashes and ORB keypoint descriptors."""
    def __init__(self, n_features: int = vision_settings.ORB_MAX_FEATURES):
        self.n_features = n_features
        if HAS_CV2 and cv2 is not None and hasattr(cv2, "ORB_create"):
            self.orb = cv2.ORB_create(nfeatures=self.n_features)
        else:
            self.orb = None

    def extract_hashes(self, pil_img: Image.Image) -> ImageHashes:
        if HAS_IMAGEHASH and imagehash is not None:
            phash_val = str(imagehash.phash(pil_img))
            dhash_val = str(imagehash.dhash(pil_img))
            ahash_val = str(imagehash.average_hash(pil_img))
            return ImageHashes(phash=phash_val, dhash=dhash_val, ahash=ahash_val)
        
        # Lightweight standard library perceptual/content hash fallback
        raw_bytes = pil_img.resize((16, 16)).convert("L").tobytes()
        h = hashlib.md5(raw_bytes).hexdigest()[:16]
        return ImageHashes(phash=h, dhash=h, ahash=h)

    def extract_orb(self, cv2_img: np.ndarray) -> Tuple[ORBFeatures, Optional[np.ndarray]]:
        if self.orb is not None and HAS_CV2 and cv2 is not None:
            gray = cv2.cvtColor(cv2_img, cv2.COLOR_BGR2GRAY) if len(cv2_img.shape) == 3 else cv2_img
            keypoints, descriptors = self.orb.detectAndCompute(gray, None)
            kp_count = len(keypoints) if keypoints else 0
            b64_desc = pack_descriptors(descriptors)
            return ORBFeatures(keypoint_count=kp_count, descriptors_b64=b64_desc), descriptors
        
        return ORBFeatures(keypoint_count=0, descriptors_b64=None), None

    @staticmethod
    def compute_hash_similarity(h1: ImageHashes, h2: ImageHashes) -> float:
        """Compute normalized similarity [0, 1] from Hamming distances."""
        if HAS_IMAGEHASH and imagehash is not None:
            try:
                p1, p2 = imagehash.hex_to_hash(h1.phash), imagehash.hex_to_hash(h2.phash)
                d1, d2 = imagehash.hex_to_hash(h1.dhash), imagehash.hex_to_hash(h2.dhash)
                a1, a2 = imagehash.hex_to_hash(h1.ahash), imagehash.hex_to_hash(h2.ahash)

                p_sim = max(0.0, 1.0 - (p1 - p2) / 64.0)
                d_sim = max(0.0, 1.0 - (d1 - d2) / 64.0)
                a_sim = max(0.0, 1.0 - (a1 - a2) / 64.0)

                return (0.5 * p_sim) + (0.3 * d_sim) + (0.2 * a_sim)
            except Exception:
                pass
        return 0.9 if h1.phash == h2.phash else 0.5

    @staticmethod
    def match_orb_descriptors(desc1: Optional[np.ndarray], desc2: Optional[np.ndarray]) -> Tuple[int, float]:
        """
        BFMatcher with NORM_HAMMING + Lowe's ratio test + inlier scoring.
        """
        if not HAS_CV2 or cv2 is None or desc1 is None or desc2 is None or len(desc1) < 4 or len(desc2) < 4:
            return 0, 0.0

        matcher = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)
        try:
            matches = matcher.knnMatch(desc1, desc2, k=2)
            good_matches = []
            for match_pair in matches:
                if len(match_pair) == 2:
                    m, n = match_pair
                    if m.distance < vision_settings.LOWE_RATIO_THRESHOLD * n.distance:
                        good_matches.append(m)

            inlier_count = len(good_matches)
            max_possible = min(len(desc1), len(desc2))
            inlier_ratio = inlier_count / max(1, max_possible)
            
            # Score scaled so 15+ good inliers gives strong match confidence
            score = min(1.0, (inlier_count / 15.0) * 0.7 + inlier_ratio * 0.3)
            return inlier_count, score
        except Exception:
            return 0, 0.0
