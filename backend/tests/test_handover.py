import pytest


def test_schedule_handover(client, finder_auth_headers):
    payload = {
        "case_id": "case-calc-8921",
        "method": "NIE_LOST_AND_FOUND_OFFICE",
        "location_name": "NIE Central Lost & Found Office (Admin Block Ground Floor)",
        "scheduled_date": "2026-09-28",
        "scheduled_time_window": "11:00 AM - 01:00 PM",
        "notes": "Will deposit after 3rd hour lecture"
    }
    response = client.post("/api/v1/handover/schedule", json=payload, headers=finder_auth_headers)
    assert response.status_code == 200
    handover = response.json()["data"]
    assert handover["caseId"] == "case-calc-8921"
    assert handover["status"] == "SCHEDULED"


def test_confirm_handover_flow(client, finder_auth_headers, claimant_auth_headers):
    # Ensure scheduled first
    client.post(
        "/api/v1/handover/schedule",
        json={
            "case_id": "case-calc-8921",
            "method": "NIE_LOST_AND_FOUND_OFFICE",
            "location_name": "NIE Central Lost & Found Office (Admin Block Ground Floor)",
            "scheduled_date": "2026-09-28",
            "scheduled_time_window": "11:00 AM - 01:00 PM"
        },
        headers=finder_auth_headers
    )

    # 1. Finder confirms deposit
    resp1 = client.post(
        "/api/v1/handover/confirm",
        json={"case_id": "case-calc-8921", "action_type": "FINDER_CONFIRM"},
        headers=finder_auth_headers
    )
    assert resp1.status_code == 200
    assert resp1.json()["data"]["isFinderConfirmed"] is True

    # 2. Recipient confirms receipt
    resp2 = client.post(
        "/api/v1/handover/confirm",
        json={"case_id": "case-calc-8921", "action_type": "RECIPIENT_RETURN_CONFIRM"},
        headers=claimant_auth_headers
    )
    assert resp2.status_code == 200
    assert resp2.json()["data"]["isClaimantConfirmed"] is True
    assert resp2.json()["data"]["status"] == "COMPLETED"
