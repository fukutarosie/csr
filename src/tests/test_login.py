import pytest
from fastapi.testclient import TestClient
import importlib
import sys
from pathlib import Path

# Ensure the src folder is on sys.path so we can import main.py
SRC_ROOT = Path(__file__).resolve().parents[1]
if str(SRC_ROOT) not in sys.path:
    sys.path.insert(0, str(SRC_ROOT))

# Import the app from main.py
main = importlib.import_module('main')
app = main.app

client = TestClient(app)


def test_login_invalid_user(monkeypatch):
    class MockAuthResponse:
        def __init__(self):
            self.success = False
            self.message = "Invalid username or password"
            self.user = None

    async def mock_login(username, password):
        return MockAuthResponse()

    monkeypatch.setattr(main.auth_controller, 'login', mock_login)

    resp = client.post('/api/login', json={'username': 'nope', 'password': 'wrong'})
    assert resp.status_code == 200
    data = resp.json()
    assert data['success'] is False
    assert 'Invalid username or password' in data['message']
    assert data['user'] is None
    assert data.get('access_token') is None


def test_login_success_returns_tokens(monkeypatch):
    class MockUser:
        def __init__(self):
            self.id = 123
            self.username = 'admin1'
            self.full_name = 'User Admin'
            self.email = 'admin@example.com'
            self.role_code = 'USER_ADMIN'
        def to_dict(self):
            return {
                'id': self.id,
                'username': self.username,
                'full_name': self.full_name,
                'email': self.email,
                'role_code': self.role_code,
                'dashboard_route': '/dashboard/admin',
                'is_active': True,
                'last_login': None
            }

    class MockAuthResponse:
        def __init__(self):
            self.success = True
            self.message = 'Login successful'
            self.user = MockUser()

    async def mock_login(username, password):
        return MockAuthResponse()

    monkeypatch.setattr(main.auth_controller, 'login', mock_login)

    resp = client.post('/api/login', json={'username': 'admin1', 'password': 'admin123'})
    assert resp.status_code == 200
    data = resp.json()
    assert data['success'] is True
    assert data['user']['username'] == 'admin1'
    assert 'access_token' in data
    assert data['access_token']
    assert 'refresh_token' in data
    assert data['refresh_token']
    assert data['expires_in'] == 3600


def test_refresh_requires_valid_token(monkeypatch):
    # Call refresh with an invalid token
    resp = client.post('/api/refresh', json={'refresh_token': 'invalid'})
    assert resp.status_code == 401

