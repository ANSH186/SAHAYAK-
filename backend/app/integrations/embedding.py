import abc
import hashlib
import math
from typing import List, Union
from app.core.config import settings


def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    if not v1 or not v2 or len(v1) != len(v2):
        return 0.0
    dot_product = sum(a * b for a, b in zip(v1, v2))
    norm_a = math.sqrt(sum(a * a for a in v1))
    norm_b = math.sqrt(sum(b * b for b in v2))
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return max(0.0, min(1.0, dot_product / (norm_a * norm_b)))


class EmbeddingProvider(abc.ABC):
    @abc.abstractmethod
    def generate_text_embedding(self, text: str) -> List[float]:
        """Generate normalized fixed-size vector embedding for text."""
        pass

    @abc.abstractmethod
    def generate_image_embedding(self, image_data: Union[bytes, str]) -> List[float]:
        """Generate normalized fixed-size vector embedding for an image."""
        pass


class DeterministicEmbeddingProvider(EmbeddingProvider):
    def __init__(self, dimension: int = 64):
        self.dim = dimension

    def _hash_to_vector(self, token: str) -> List[float]:
        vec = [0.0] * self.dim
        if not token:
            return vec
        # Use SHA256 chunks for deterministic semantic spreading
        h = hashlib.sha256(token.lower().strip().encode("utf-8")).digest()
        for i in range(self.dim):
            byte_val = h[i % len(h)]
            # Symmetrically centered [-1.0, 1.0]
            vec[i] = (byte_val / 127.5) - 1.0
        return vec

    def generate_text_embedding(self, text: str) -> List[float]:
        if not text:
            return [0.0] * self.dim
        tokens = [t for t in text.lower().split() if len(t) > 1]
        if not tokens:
            return [0.0] * self.dim

        accum = [0.0] * self.dim
        for token in tokens:
            token_vec = self._hash_to_vector(token)
            for i in range(self.dim):
                accum[i] += token_vec[i]

        norm = math.sqrt(sum(x * x for x in accum))
        if norm > 0:
            accum = [x / norm for x in accum]
        return accum

    def generate_image_embedding(self, image_data: Union[bytes, str]) -> List[float]:
        if isinstance(image_data, str):
            # If a URL or path is provided, seed based on image identifier
            return self.generate_text_embedding(f"image_feature_{image_data}")
        elif isinstance(image_data, bytes):
            # Compute hash of first 4KB of image data
            digest = hashlib.sha256(image_data[:4096]).hexdigest()
            return self.generate_text_embedding(f"image_digest_{digest}")
        return [0.0] * self.dim


def get_embedding_provider() -> EmbeddingProvider:
    return DeterministicEmbeddingProvider()
