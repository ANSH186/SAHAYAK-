import pytest


def test_list_reports(client):
    response = client.get("/api/v1/reports")
    assert response.status_code == 200
    json_data = response.json()
    assert isinstance(json_data["data"], list)
    assert len(json_data["data"]) >= 1


def test_filter_reports_by_type(client):
    response = client.get("/api/v1/reports?type=LOST")
    assert response.status_code == 200
    items = response.json()["data"]
    for item in items:
        assert item["type"] == "LOST"


def test_create_lost_report(client, student_auth_headers):
    payload = {
        "report_type": "LOST",
        "title": "Sony WH-1000XM4 Headphones",
        "category": "ELECTRONICS",
        "description": "Black noise cancelling headphones in a hard zip case. Left in library reading room.",
        "incident_place": "Central Digital Library",
        "brand": "Sony",
        "color": "Black",
        "distinguishing_marks": "Custom gold sticker on headband",
        "secret_verification_clue": "Custom gold sticker on headband with initials RA"
    }
    response = client.post("/api/v1/reports", json=payload, headers=student_auth_headers)
    assert response.status_code == 200
    created = response.json()["data"]
    assert created["title"] == "Sony WH-1000XM4 Headphones"
    assert created["status"] == "ACTIVE"


def test_invalid_status_transition(client, student_auth_headers):
    # Fetch a report
    reports_resp = client.get("/api/v1/reports")
    report_id = reports_resp.json()["data"][0]["id"]
    
    # Try invalid jump: ACTIVE -> SAFELY_RETURNED directly without handover
    response = client.patch(
        f"/api/v1/reports/{report_id}/status",
        json={"new_status": "SAFELY_RETURNED"},
        headers=student_auth_headers
    )
    # Should be rejected with 400 Bad Request
    assert response.status_code == 400
