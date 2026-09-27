import pytest


def test_get_verification_case_does_not_leak_expected_answer(client, claimant_auth_headers):
    response = client.get("/api/v1/verification/cases/case-calc-8921", headers=claimant_auth_headers)
    assert response.status_code == 200
    case = response.json()["data"]
    assert case["id"] == "case-calc-8921"
    for q in case["questions"]:
        # Verify that expected_answer is not exposed in public schema
        assert "expected_answer" not in q
        assert "expected_answer_normalized" not in q


def test_submit_correct_verification_answer(client, claimant_auth_headers):
    # Student std-3 owns the casio claim
    response = client.post(
        "/api/v1/verification/cases/case-calc-8921/answers",
        json={
            "case_id": "case-calc-8921",
            "answers": ["4ni21ec045 engraved with pencil"]
        },
        headers=claimant_auth_headers
    )
    assert response.status_code == 200
    case = response.json()["data"]
    assert case["status"] == "OWNERSHIP_CONFIRMED"
    assert case["handoverOtp"] is not None


def test_manual_review_proctor_action(client, admin_auth_headers):
    response = client.post(
        "/api/v1/verification/cases/case-calc-8921/manual-review",
        json={
            "decision": "APPROVE",
            "staff_notes": "Student verified in person with physical ID card",
            "assigned_staff": "Dr. H. S. Sridhar"
        },
        headers=admin_auth_headers
    )
    assert response.status_code == 200
    case = response.json()["data"]
    assert case["status"] == "OWNERSHIP_CONFIRMED"
