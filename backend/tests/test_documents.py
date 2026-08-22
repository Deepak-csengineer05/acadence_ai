import io
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_unauthenticated_document_list_rejected():
    """Verify GET /documents requires authentication."""
    response = client.get("/api/v1/documents/")
    assert response.status_code == 401

def test_invalid_file_extension_rejected():
    """Verify uploading executable/unsupported extensions is rejected."""
    # First obtain access token
    reg_resp = client.post(
        "/api/v1/auth/register",
        json={
            "email": "uploader_test@college.edu",
            "password": "Password123!",
            "full_name": "File Uploader",
            "academic_year": "III",
            "department": "CSE"
        }
    )
    token = ""
    if reg_resp.status_code == 201:
        login_resp = client.post(
            "/api/v1/auth/login",
            data={"username": "uploader_test@college.edu", "password": "Password123!"}
        )
        token = login_resp.json().get("access_token", "")

    if token:
        fake_exe = io.BytesIO(b"MZExecutableData")
        upload_resp = client.post(
            "/api/v1/documents/upload",
            headers={"Authorization": f"Bearer {token}"},
            data={"title": "Dangerous File", "category_id": 1},
            files={"file": ("malicious.exe", fake_exe, "application/octet-stream")}
        )
        assert upload_resp.status_code == 400
