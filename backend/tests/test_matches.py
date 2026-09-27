import pytest


def test_list_matches(client):
    response = client.get("/api/v1/matches")
    assert response.status_code == 200
    matches = response.json()["data"]
    assert isinstance(matches, list)
    assert len(matches) >= 1
    
    first_match = matches[0]
    assert "signals" in first_match
    assert "similarityScore" in first_match
    assert "lostReport" in first_match
    assert "foundReport" in first_match


def test_get_match_detail(client):
    response = client.get("/api/v1/matches/mat-hp-laptop")
    assert response.status_code == 200
    match = response.json()["data"]
    assert match["id"] == "mat-hp-laptop"
    assert match["similarityScore"] >= 0.80
    assert len(match["signals"]["reasons"]) > 0
