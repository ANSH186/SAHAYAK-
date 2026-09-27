import base64
from typing import Optional
import numpy as np


def pack_descriptors(descriptors: Optional[np.ndarray]) -> Optional[str]:
    """Base64 encode OpenCV uint8 feature descriptors for JSON transmission."""
    if descriptors is None or len(descriptors) == 0:
        return None
    raw_bytes = descriptors.astype(np.uint8).tobytes()
    return base64.b64encode(raw_bytes).decode("ascii")


def unpack_descriptors(b64_str: Optional[str], feature_dim: int = 32) -> Optional[np.ndarray]:
    """Decode Base64 string back to OpenCV uint8 feature descriptors."""
    if not b64_str:
        return None
    try:
        raw_bytes = base64.b64decode(b64_str.encode("ascii"))
        arr = np.frombuffer(raw_bytes, dtype=np.uint8)
        if len(arr) % feature_dim != 0:
            return None
        return arr.reshape(-1, feature_dim)
    except Exception:
        return None
