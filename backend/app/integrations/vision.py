import abc
import io
import struct
from typing import Dict, Optional, Tuple


class VisionProvider(abc.ABC):
    @abc.abstractmethod
    def validate_image(self, data: bytes) -> Tuple[bool, str, Optional[Tuple[int, int]]]:
        """Validate image content, detect actual mime type and dimensions."""
        pass

    @abc.abstractmethod
    def compare_images(self, image1_bytes: bytes, image2_bytes: bytes) -> float:
        """Calculate visual similarity score between two images (0.0 to 1.0)."""
        pass


class MockVisionProvider(VisionProvider):
    def validate_image(self, data: bytes) -> Tuple[bool, str, Optional[Tuple[int, int]]]:
        if not data or len(data) < 12:
            return False, "unknown", None

        # JPEG signature: \xFF\xD8\xFF
        if data.startswith(b"\xff\xd8\xff"):
            return True, "image/jpeg", (800, 600)

        # PNG signature: \x89PNG\r\n\x1a\n
        if data.startswith(b"\x89PNG\r\n\x1a\n"):
            try:
                width, height = struct.unpack(">II", data[16:24])
                return True, "image/png", (width, height)
            except Exception:
                return True, "image/png", (800, 600)

        # WEBP signature: RIFF....WEBP
        if data.startswith(b"RIFF") and data[8:12] == b"WEBP":
            return True, "image/webp", (800, 600)

        # Allow basic fallback for testing dummy images if needed
        return True, "image/jpeg", (800, 600)

    def compare_images(self, image1_bytes: bytes, image2_bytes: bytes) -> float:
        if not image1_bytes or not image2_bytes:
            return 0.50
        # Byte length comparison ratio as simple mock metric
        ratio = min(len(image1_bytes), len(image2_bytes)) / max(len(image1_bytes), len(image2_bytes))
        return float(round(0.60 + 0.35 * ratio, 2))


def get_vision_provider() -> VisionProvider:
    return MockVisionProvider()
