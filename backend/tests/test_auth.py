import pytest


def test_student_login_success(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "rahul.nie@nie.ac.in", "password": "Student@123"}
    )
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["data"]["access_token"] is not None
    assert json_data["data"]["user"]["email"] == "rahul.nie@nie.ac.in"


def test_student_login_invalid_password(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "rahul.nie@nie.ac.in", "password": "WrongPassword"}
    )
    assert response.status_code == 401


def test_student_registration_flow(client):
    new_usn = "4NI23CS999"
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "newstudent@nie.ac.in",
            "password": "SecurePassword123!",
            "full_name": "New Student",
            "usn": new_usn,
            "branch": "Computer Science & Engineering",
            "semester": 3,
            "section": "A"
        }
    )
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["data"]["user"]["usn"] == new_usn
    assert json_data["data"]["access_token"] is not None


def test_admin_login(client):
    response = client.post(
        "/api/v1/auth/admin/login",
        json={"email": "admin@nie.ac.in", "password": "Admin@123"}
    )
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["data"]["user"]["role"] == "admin"


def test_get_me(client, student_auth_headers):
    response = client.get("/api/v1/auth/me", headers=student_auth_headers)
    assert response.status_code == 200
    assert response.json()["data"]["email"] == "rahul.nie@nie.ac.in"
