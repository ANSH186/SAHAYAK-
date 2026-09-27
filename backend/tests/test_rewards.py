import pytest


def test_get_reward_balance(client, student_auth_headers):
    response = client.get("/api/v1/rewards/balance", headers=student_auth_headers)
    assert response.status_code == 200
    data = response.json()["data"]
    assert "points" in data
    assert "badgeLevel" in data


def test_get_leaderboard(client):
    response = client.get("/api/v1/rewards/leaderboard")
    assert response.status_code == 200
    leaderboard = response.json()["data"]
    assert isinstance(leaderboard, list)
    assert len(leaderboard) >= 1
    # Verify rankings are strictly descending by points
    points = [entry["points"] for entry in leaderboard]
    assert points == sorted(points, reverse=True)


def test_get_certificate(client, student_auth_headers):
    response = client.get("/api/v1/rewards/certificate/NIE-LF-2026-92841A", headers=student_auth_headers)
    assert response.status_code == 200
    cert = response.json()["data"]
    assert cert["recipientName"] is not None
    assert "signatory" in cert
