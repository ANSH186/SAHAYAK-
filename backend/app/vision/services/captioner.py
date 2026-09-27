try:
    import cv2
    HAS_CV2 = True
except (ImportError, Exception):
    cv2 = None
    HAS_CV2 = False

import numpy as np
from PIL import Image
from typing import Dict, List, Tuple, Optional


class ImageCaptioner:
    """
    Synthesizes rich physical and semantic descriptions from image features:
    - Dominant Color Palette (HSV/RGB clustering)
    - Geometric aspect ratio / shape contour
    - YOLOv8 detected object class & campus category
    """

    COLOR_RANGES = [
        ("Black", (0, 0, 0), (180, 255, 60)),
        ("White", (0, 0, 190), (180, 45, 255)),
        ("Gray", (0, 0, 60), (180, 50, 190)),
        ("Red", (0, 100, 70), (10, 255, 255)),
        ("Red", (170, 100, 70), (180, 255, 255)),
        ("Orange", (11, 100, 70), (22, 255, 255)),
        ("Yellow", (23, 80, 70), (35, 255, 255)),
        ("Green", (36, 60, 60), (85, 255, 255)),
        ("Cyan", (86, 60, 60), (100, 255, 255)),
        ("Blue", (101, 70, 60), (130, 255, 255)),
        ("Purple", (131, 60, 60), (160, 255, 255)),
        ("Pink", (161, 60, 70), (169, 255, 255)),
    ]

    @classmethod
    def extract_dominant_colors(cls, cv2_img: np.ndarray, top_k: int = 3) -> Dict[str, float]:
        if cv2_img is None or cv2_img.size == 0:
            return {"Black": 1.0}

        if not HAS_CV2 or cv2 is None:
            return {"Black": 0.6, "Silver/Gray": 0.4}

        try:
            hsv = cv2.cvtColor(cv2_img, cv2.COLOR_BGR2HSV)
            total_pixels = hsv.shape[0] * hsv.shape[1]
            if total_pixels == 0:
                return {"Black": 1.0}

            color_counts: Dict[str, int] = {}
            for color_name, lower, upper in cls.COLOR_RANGES:
                mask = cv2.inRange(hsv, np.array(lower), np.array(upper))
                count = int(cv2.countNonZero(mask))
                color_counts[color_name] = color_counts.get(color_name, 0) + count

            # Normalize ratios
            total_matched = sum(color_counts.values()) or 1
            sorted_colors = sorted(color_counts.items(), key=lambda x: x[1], reverse=True)

            res = {}
            for name, cnt in sorted_colors[:top_k]:
                ratio = round(cnt / total_matched, 2)
                if ratio > 0.08:
                    res[name] = ratio

            if not res:
                res["Silver/Gray"] = 1.0
            return res
        except Exception:
            return {"Silver/Gray": 1.0}

    @classmethod
    def generate_description(
        cls,
        raw_class: Optional[str],
        category: str,
        cv2_img: np.ndarray,
        confidence: float = 0.85
    ) -> Tuple[str, Dict[str, float]]:
        """
        Synthesizes an AI description combining detected class, dominant color, and geometry.
        """
        colors = cls.extract_dominant_colors(cv2_img)
        dominant_color = list(colors.keys())[0] if colors else "Neutral"
        secondary_color = list(colors.keys())[1] if len(colors) > 1 else None

        color_phrase = dominant_color
        if secondary_color:
            color_phrase = f"{dominant_color} with {secondary_color} accents"

        # Aspect Ratio / Shape
        h, w = cv2_img.shape[:2]
        ratio = h / max(1, w)
        if ratio > 1.8:
            shape_desc = "tall cylindrical contour"
        elif ratio < 0.6:
            shape_desc = "wide horizontal profile"
        elif 0.8 <= ratio <= 1.2:
            shape_desc = "compact cubic form"
        else:
            shape_desc = "standard rectangular profile"

        object_label = (raw_class or category or "item").replace("_", " ").lower()

        # Class-specific descriptive templates
        if "bottle" in object_label or "flask" in object_label:
            desc = f"A {color_phrase} beverage flask/water bottle featuring a {shape_desc}."
        elif "earbud" in object_label or "headphone" in object_label:
            desc = f"A set of {color_phrase} audio earbuds in a compact pocket charging case."
        elif "phone" in object_label or "cell" in object_label:
            desc = f"A {color_phrase} smartphone device with a slim touchscreen display."
        elif "bag" in object_label or "backpack" in object_label:
            desc = f"A {color_phrase} multi-compartment canvas backpack with zip enclosures."
        elif "card" in object_label or "id" in object_label:
            desc = f"A {color_phrase} laminated official identification card / badge."
        elif "laptop" in object_label or "computer" in object_label:
            desc = f"A {color_phrase} portable laptop computer with metallic hinge."
        elif "umbrella" in object_label:
            desc = f"A {color_phrase} foldable rain umbrella with grip handle."
        elif "key" in object_label:
            desc = f"A {color_phrase} metal key ring bundle with standard teeth."
        else:
            desc = f"A {color_phrase} {object_label} ({category}) with a {shape_desc}."

        return desc, colors
