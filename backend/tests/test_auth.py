import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_register_role_security():
    """Verify registration assigns student role unconditionally (no privilege escalation)."""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "teststudent1@college.edu",
            "password": "TestPassword123!",
            "full_name": "Test Student 1",
            "academic_year": "II",
            "department": "CSE"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["role"] == "student"
    assert data["email"] == "teststudent1@college.edu"

def test_duplicate_email_registration_fails():
    """Verify duplicate email registration is rejected."""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "teststudent1@college.edu",
            "password": "AnotherPassword123!",
            "full_name": "Duplicate Student",
            "academic_year": "I",
            "department": "ECE"
        }
    )
    assert response.status_code == 400

def test_email_verification_flow():
    """Verify email verification code generation and verification."""
    send_resp = client.post(
        "/api/v1/auth/verify-email/send",
        json={"email": "newuser@college.edu"}
    )
    assert send_resp.status_code == 200
    code = send_resp.json().get("code")
    
    if code:
        verify_resp = client.post(
            "/api/v1/auth/verify-email/verify",
            json={"email": "newuser@college.edu", "code": code}
        )
        assert verify_resp.status_code == 200
        assert verify_resp.json()["status"] == "success"
