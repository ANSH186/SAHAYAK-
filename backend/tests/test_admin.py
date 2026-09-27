import pytest


def test_student_cannot_access_admin_dashboard(client, student_auth_headers):
    response = client.get("/api/v1/admin/dashboard", headers=student_auth_headers)
    assert response.status_code == 403


def test_admin_dashboard_metrics(client, admin_auth_headers):
    response = client.get("/api/v1/admin/dashboard", headers=admin_auth_headers)
    assert response.status_code == 200
    metrics = response.json()["data"]
    assert "totalReports" in metrics
    assert "lostCount" in metrics
    assert "foundCount" in metrics
    assert "recoveryRatePercentage" in metrics


def test_admin_audit_logs(client, admin_auth_headers):
    response = client.get("/api/v1/admin/audit", headers=admin_auth_headers)
    assert response.status_code == 200
    logs = response.json()["data"]
    assert isinstance(logs, list)
    assert len(logs) >= 1
