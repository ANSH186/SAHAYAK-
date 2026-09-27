import pytest


def test_assistant_chat_faq(client):
    response = client.post(
        "/api/v1/assistant/chat",
        json={"message": "How do I report a lost item?"}
    )
    assert response.status_code == 200
    json_data = response.json()
    assert "Report Lost" in json_data["data"]["reply"] or "student dashboard" in json_data["data"]["reply"]


def test_ai_describe_facts_without_hallucinations(client):
    payload = {
        "title": "Water Bottle",
        "category": "Water Bottles",
        "color": "Midnight Blue",
        "brand": "Milton",
        "incidentPlace": "Sir MV Block 2nd Floor",
        "distinguishingMarks": "Dent on bottom base"
    }
    response = client.post("/api/v1/ai/describe", json=payload)
    assert response.status_code == 200
    data = response.json()["data"]
    assert "Milton Water Bottle" in data["enhanced_title"]
    assert "Midnight Blue" in data["enhanced_description"]
    assert "Dent on bottom base" in data["enhanced_description"]
