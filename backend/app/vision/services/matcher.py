import logging
from typing import List, Tuple, Dict, Any

from app.vision.core.config import vision_settings
from app.vision.schemas.comparison import (
    ComparisonResult, MatchSignals, CandidatePayload, RankedMatch, MultiMatchResponse
)
from app.vision.schemas.features import ProcessedItem
from app.vision.services.embedder import VisualEmbedder
from app.vision.services.visual_features import VisualFeatureExtractor
from app.vision.utils.serialization import unpack_descriptors

logger = logging.getLogger("sahayak.vision.matcher")


class VisualMatchingEngine:
    """
    Multi-signal visual matching engine combining:
    - OpenCLIP semantic embedding similarity
    - Perceptual hashes (pHash, dHash, aHash)
    - ORB local invariant descriptors + BFMatcher
    - Category compatibility
    """
    def __init__(self):
        self.feature_extractor = VisualFeatureExtractor()
        self.embedder = VisualEmbedder()

    def compare_items(self, item_a: ProcessedItem, item_b: ProcessedItem) -> ComparisonResult:
        reasons: List[str] = []

        desc_a = item_a.description or f"{item_a.detection.category} ({item_a.detection.raw_class_name or 'item'})"
        desc_b = item_b.description or f"{item_b.detection.category} ({item_b.detection.raw_class_name or 'item'})"

        # 1. Class / Category Compatibility Check
        cat_a = (item_a.detection.category or "").lower().strip()
        cat_b = (item_b.detection.category or "").lower().strip()
        raw_a = (item_a.detection.raw_class_name or "").lower().strip()
        raw_b = (item_b.detection.raw_class_name or "").lower().strip()

        # Determine incompatible classes (e.g. Earbuds vs Bottle, Phone vs Backpack, Keys vs Card)
        is_class_compatible = True
        if cat_a and cat_b and cat_a != cat_b:
            # Different top-level campus categories
            is_class_compatible = False
        elif raw_a and raw_b and raw_a != raw_b:
            incompatible_pairs = [
                ({"bottle", "flask"}, {"earbud", "headphones", "cell phone", "phone", "backpack", "handbag", "umbrella", "laptop"}),
                ({"earbud", "headphones"}, {"bottle", "flask", "backpack", "umbrella", "book", "keys"}),
                ({"laptop", "computer"}, {"umbrella", "bottle", "shoes", "keys"}),
                ({"keys"}, {"backpack", "bottle", "laptop", "umbrella"})
            ]
            for group1, group2 in incompatible_pairs:
                if (any(g in raw_a for g in group1) and any(g in raw_b for g in group2)) or \
                   (any(g in raw_a for g in group2) and any(g in raw_b for g in group1)):
                    is_class_compatible = False
                    break

        # 2. Semantic Description Similarity (Token Jaccard & Attribute Overlap)
        words_a = set(w.lower().strip(".,!?:;") for w in desc_a.split() if len(w) > 2)
        words_b = set(w.lower().strip(".,!?:;") for w in desc_b.split() if len(w) > 2)
        union_words = words_a.union(words_b)
        inter_words = words_a.intersection(words_b)
        token_sim = len(inter_words) / max(1, len(union_words)) if union_words else 0.0

        # Color palette overlap
        colors_a = set((item_a.color_distribution or {}).keys())
        colors_b = set((item_b.color_distribution or {}).keys())
        color_overlap = len(colors_a.intersection(colors_b)) > 0 if (colors_a and colors_b) else False

        desc_sim = min(1.0, token_sim * 0.7 + (0.3 if color_overlap else 0.0) + (0.3 if is_class_compatible else 0.0))

        # 3. CLIP Visual Semantic Similarity
        clip_sim = self.embedder.cosine_similarity(
            item_a.embedding.vector,
            item_b.embedding.vector
        )

        # 4. Perceptual Hash Similarity
        hash_sim = self.feature_extractor.compute_hash_similarity(
            item_a.hashes,
            item_b.hashes
        )

        # 5. ORB Keypoints Match
        desc_mat_a = unpack_descriptors(item_a.orb.descriptors_b64)
        desc_mat_b = unpack_descriptors(item_b.orb.descriptors_b64)
        inliers, orb_score = self.feature_extractor.match_orb_descriptors(desc_mat_a, desc_mat_b)

        # 6. Negative Penalty Scoring for Incompatible Classes
        if not is_class_compatible:
            class_penalty = -1.0
            overall_confidence = -1.0  # Strict negative score
            verdict = "CLASS_MISMATCH_PENALTY"
            is_match = False
            reasons.append(
                f"❌ Class Rejection: Item A ('{item_a.detection.category}') and Item B ('{item_b.detection.category}') belong to incompatible object classes. Negative penalty score (-1.0) applied."
            )
            cat_match = -1.0
        else:
            class_penalty = 0.0
            cat_match = 1.0
            if clip_sim >= 0.75:
                reasons.append(f"Strong visual semantic match ({clip_sim*100:.1f}%)")
            if desc_sim >= 0.50:
                reasons.append(f"Matching AI image descriptions: '{desc_a}' ⟷ '{desc_b}' ({desc_sim*100:.0f}%)")
            if hash_sim >= 0.70:
                reasons.append("Structural layout and color gradient correspondence")
            if inliers >= 6:
                reasons.append(f"Detected {inliers} fine-grained local visual keypoint matches")
            if color_overlap:
                reasons.append(f"Shared dominant color palette: {', '.join(colors_a.intersection(colors_b))}")

            # Composite Positive Fusion Score
            overall_confidence = (
                0.35 * clip_sim +
                0.25 * desc_sim +
                0.15 * hash_sim +
                0.15 * orb_score +
                0.10 * cat_match
            )

            # Decision Thresholds
            if overall_confidence >= vision_settings.HIGH_CONFIDENCE_THRESHOLD:
                verdict = "MATCH"
                is_match = True
            elif overall_confidence >= vision_settings.SIMILARITY_MATCH_THRESHOLD:
                verdict = "POSSIBLE_MATCH"
                is_match = True
            else:
                verdict = "NO_MATCH"
                is_match = False

        signals = MatchSignals(
            clip_similarity=round(clip_sim, 4),
            description_similarity=round(desc_sim, 4),
            hash_similarity=round(hash_sim, 4),
            orb_inliers_score=round(orb_score, 4),
            category_match=round(cat_match, 4),
            class_penalty=round(class_penalty, 4),
            overall_confidence=round(overall_confidence, 4)
        )

        return ComparisonResult(
            match=is_match,
            confidence=round(overall_confidence, 4),
            verdict=verdict,
            description_a=desc_a,
            description_b=desc_b,
            class_compatible=is_class_compatible,
            signals=signals,
            reasons=reasons
        )

    def rank_candidates(
        self,
        query_item: ProcessedItem,
        candidates: List[CandidatePayload]
    ) -> List[RankedMatch]:
        ranked: List[RankedMatch] = []

        for candidate in candidates:
            comp = self.compare_items(query_item, candidate.features)
            ranked.append(RankedMatch(
                candidate_id=candidate.id,
                title=candidate.title,
                confidence=comp.confidence,
                verdict=comp.verdict,
                signals=comp.signals,
                reasons=comp.reasons
            ))

        # Sort descending by confidence
        ranked.sort(key=lambda r: r.confidence, reverse=True)
        return ranked


_engine_instance = None

def get_matching_engine() -> VisualMatchingEngine:
    global _engine_instance
    if _engine_instance is None:
        _engine_instance = VisualMatchingEngine()
    return _engine_instance
