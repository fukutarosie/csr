"""
Integration tests for user management functionality
"""
from fastapi.testclient import TestClient
from main import app
import pytest
from typing import Dict

client = TestClient(app)

@pytest.fixture
def admin_token() -> Dict[str, str]:
    """Get admin token for authenticated requests"""
    response = client.post("/api/login", json={
        "username": "admin",
        "password": "admin123",
        "role_code": "USER_ADMIN"
    })
    assert response.status_code == 200
    return {"Authorization": f"Bearer {response.json()['access_token']}"}

def test_create_and_update_user(admin_token):
    # 1. Create a test user
    create_data = {
        "username": "testuser",
        "password": "test123",
        "full_name": "Test User",
        "email": "test@example.com",
        "role_id": 2  # Adjust based on your role IDs
    }
    
    response = client.post("/api/users", json=create_data, headers=admin_token)
    assert response.status_code == 200
    user_id = response.json()["user"]["id"]
    
    # 2. Update the user
    update_data = {
        "full_name": "Updated Test User",
        "email": "updated@example.com",
        "is_active": True
    }
    
    response = client.put(f"/api/users/{user_id}", json=update_data, headers=admin_token)
    assert response.status_code == 200
    updated_user = response.json()["user"]
    assert updated_user["full_name"] == update_data["full_name"]
    assert updated_user["email"] == update_data["email"]
    assert updated_user["is_active"] == update_data["is_active"]

def test_user_deactivation(admin_token):
    # 1. Create a test user
    create_data = {
        "username": "deactivate_test",
        "password": "test123",
        "full_name": "Deactivate Test",
        "email": "deactivate@example.com",
        "role_id": 2
    }
    
    response = client.post("/api/users", json=create_data, headers=admin_token)
    assert response.status_code == 200
    user_id = response.json()["user"]["id"]
    
    # 2. Deactivate the user
    update_data = {"is_active": False}
    response = client.put(f"/api/users/{user_id}", json=update_data, headers=admin_token)
    assert response.status_code == 200
    assert response.json()["user"]["is_active"] == False

def test_invalid_updates(admin_token):
    # Test invalid role_id
    response = client.put("/api/users/1", json={"role_id": 999}, headers=admin_token)
    assert response.status_code == 400
    
    # Test invalid email format
    response = client.put("/api/users/1", json={"email": "invalid-email"}, headers=admin_token)
    assert response.status_code == 400