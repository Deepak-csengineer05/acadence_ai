import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_search_query_unauthenticated():
    """Verify search query requires authentication."""
    response = client.post("/api/v1/search/query", json={"query": "Database"})
    assert response.status_code == 401

def test_search_query_authenticated():
    """Verify search query returns structured results for authenticated user."""
    reg_resp = client.post(
        "/api/v1/auth/register",
        json={
            "email": "searcher@college.edu",
            "password": "Password123!",
            "full_name": "Search User",
            "academic_year": "IV",
            "department": "CSE"
        }
    )
    login_resp = client.post(
        "/api/v1/auth/login",
        data={"username": "searcher@college.edu", "password": "Password123!"}
    )
    token = login_resp.json()["access_token"]
    
    response = client.post(
        "/api/v1/search/query",
        headers={"Authorization": f"Bearer {token}"},
        json={"query": "Operating Systems", "sort_by": "date"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)
