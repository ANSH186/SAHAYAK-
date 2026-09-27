import logging
from typing import Optional

logger = logging.getLogger("sahayak.vision.device")


def get_device() -> str:
    """
    Safely determine compute device (CPU vs CUDA).
    Explicitly defaults to CPU if CUDA is unavailable.
    """
    try:
        import torch
        if torch.cuda.is_available():
            device_name = torch.cuda.get_device_name(0)
            logger.info(f"CUDA Hardware Acceleration detected: {device_name}")
            return "cuda"
    except Exception as e:
        logger.debug(f"Torch device check note: {e}")
    
    logger.info("Using CPU for Computer Vision inference")
    return "cpu"
