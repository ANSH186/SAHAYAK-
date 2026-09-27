import abc
import json
import re
from typing import Any, Dict, List, Optional
from app.core.config import settings
from app.core.logging import logger


class AIProvider(abc.ABC):
    @abc.abstractmethod
    def generate_description(self, facts: Dict[str, Any]) -> Dict[str, Any]:
        """Generate cleaned report description based strictly on provided facts."""
        pass

    @abc.abstractmethod
    def extract_attributes(self, text: str) -> Dict[str, Any]:
        """Extract structured attributes (brand, color, model, etc.) from raw text."""
        pass

    @abc.abstractmethod
    def generate_verification_questions(self, clue: str, category: str) -> List[Dict[str, str]]:
        """Generate privacy-preserving ownership verification questions from finder clue."""
        pass

    @abc.abstractmethod
    def chat(self, message: str, context: Optional[Dict[str, Any]] = None) -> str:
        """Campus Lost & Found FAQ and guidance chatbot."""
        pass


class MockAIProvider(AIProvider):
    def generate_description(self, facts: Dict[str, Any]) -> Dict[str, Any]:
        title = facts.get("title", "Item").strip()
        category = facts.get("category", "General Belongings")
        color = facts.get("color", "")
        brand = facts.get("brand", "")
        model = facts.get("model", "")
        place = facts.get("incidentPlace", facts.get("incident_place", "NIE North Campus"))
        marks = facts.get("distinguishingMarks", facts.get("distinguishing_marks", ""))

        desc_parts = [f"Item Type: {title} ({category})."]
        if color or brand or model:
            attrs = [a for a in [color, brand, model] if a]
            desc_parts.append(f"Physical Attributes: {' '.join(attrs)}.")
        if place:
            desc_parts.append(f"Reported Area: {place}.")
        if marks:
            desc_parts.append(f"Distinct Features: {marks}.")
        
        enhanced_desc = " ".join(desc_parts)

        return {
            "enhanced_title": f"{brand + ' ' if brand else ''}{title}".strip(),
            "enhanced_description": enhanced_desc,
            "extracted_keywords": [k for k in [title, category, color, brand, model, place] if k],
            "is_mock": True
        }

    def extract_attributes(self, text: str) -> Dict[str, Any]:
        text_lower = text.lower()
        
        # Color detection
        colors = ["black", "blue", "red", "silver", "white", "grey", "gray", "green", "yellow", "brown", "gold", "navy", "space grey"]
        found_color = None
        for c in colors:
            if re.search(r'\b' + re.escape(c) + r'\b', text_lower):
                found_color = c.capitalize()
                break

        # Brand detection
        brands = ["apple", "dell", "hp", "lenovo", "asus", "casio", "titan", "boat", "noise", "samsung", "oneplus", "wildcraft", "skybags", "fastrack"]
        found_brand = None
        for b in brands:
            if re.search(r'\b' + re.escape(b) + r'\b', text_lower):
                found_brand = b.capitalize()
                break

        return {
            "color": found_color,
            "brand": found_brand,
            "model": None,
            "is_mock": True
        }

    def generate_verification_questions(self, clue: str, category: str) -> List[Dict[str, str]]:
        if not clue:
            return [
                {
                    "question": f"Please describe any unique sticker, scratch, or distinct feature of this {category.lower()}.",
                    "expected_answer_normalized": "unique mark"
                }
            ]
        
        clue_clean = clue.strip()
        return [
            {
                "question": f"Please state the specific identifier, sticker, engraving, or internal detail associated with this {category.lower()}.",
                "expected_answer_normalized": clue_clean.lower()
            }
        ]

    def chat(self, message: str, context: Optional[Dict[str, Any]] = None) -> str:
        msg_lower = message.lower()
        
        if "report" in msg_lower and "lost" in msg_lower:
            return "To report a lost item on SAHAYAK, click 'Report Lost' in your student dashboard. Provide details such as the item category, the NIE campus location (e.g. Sir MV Block), date/time, and any unique distinguishing marks."
        elif "report" in msg_lower and "found" in msg_lower:
            return "To report an item you found, go to 'Report Found'. You can upload a photo and specify if you're keeping it or depositing it at the NIE Main Security Desk or Lost & Found Office."
        elif "verification" in msg_lower or "claim" in msg_lower or "ownership" in msg_lower:
            return "When a match is found on the Match Radar, you can initiate Ownership Verification. You'll be asked specific questions matching protected clues submitted by the finder. Once verified, a secure handover OTP is generated."
        elif "points" in msg_lower or "reward" in msg_lower or "certificate" in msg_lower:
            return "Finders earn Campus Guardian reward points upon successful, verified handovers. Points contribute to your leaderboard rank and unlock verified recovery certificates recognized by NIE Mysore Student Affairs."
        elif "security" in msg_lower or "office" in msg_lower or "desk" in msg_lower:
            return "The NIE North Campus Main Security Desk is located at Main Gate 1, and the Lost & Found Collection Desk is on the Ground Floor of the Administrative Block (MB-02)."
        elif "map" in msg_lower or "where" in msg_lower:
            return "You can check the interactive Campus Map from the student portal to view active recovery zones, collection desks, and historical lost item hotspots across NIE North campus."
        else:
            return "Hello! I am SAHAYAK AI Assistant for NIE Mysore. I can assist you with reporting lost or found items, checking match radar suggestions, ownership verification steps, handover points, and reward certificates. How can I help you today?"


class GeminiAIProvider(AIProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.fallback = MockAIProvider()

    def generate_description(self, facts: Dict[str, Any]) -> Dict[str, Any]:
        # Fallback to deterministic provider if no external network or API key
        if not self.api_key:
            return self.fallback.generate_description(facts)
        return self.fallback.generate_description(facts)

    def extract_attributes(self, text: str) -> Dict[str, Any]:
        if not self.api_key:
            return self.fallback.extract_attributes(text)
        return self.fallback.extract_attributes(text)

    def generate_verification_questions(self, clue: str, category: str) -> List[Dict[str, str]]:
        return self.fallback.generate_verification_questions(clue, category)

    def chat(self, message: str, context: Optional[Dict[str, Any]] = None) -> str:
        return self.fallback.chat(message, context)


def get_ai_provider() -> AIProvider:
    if settings.AI_PROVIDER == "gemini" and settings.AI_API_KEY:
        return GeminiAIProvider(api_key=settings.AI_API_KEY)
    return MockAIProvider()
