import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from backend.main import app

client = TestClient(app)

# Mocked data for tests
MOCK_ISSUES = [
    {
        "id": "BUG-101",
        "title": "Application crashes on startup when offline",
        "status": "Open",
        "severity": "Critical",
        "date": "2026-03-14",
        "reporter": "Alice Smith",
        "description": "Mock description"
    },
    {
        "id": "BUG-102",
        "title": "Dark mode toggle icon does not update",
        "status": "In Progress",
        "severity": "Low",
        "date": "2026-03-13",
        "reporter": "Bob Jones",
        "description": "Another mock description"
    }
]

@pytest.fixture
def mock_db_connection():
    with patch("backend.main.get_db_connection") as mock_conn_func:
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        
        # Setup context manager for cursor
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor
        mock_conn_func.return_value = mock_conn
        
        yield mock_cursor

def test_get_all_issues(mock_db_connection):
    mock_db_connection.fetchall.return_value = MOCK_ISSUES

    response = client.get("/api/issues")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["id"] == "BUG-101"

def test_get_single_issue(mock_db_connection):
    mock_db_connection.fetchone.return_value = MOCK_ISSUES[0]

    response = client.get("/api/issues/BUG-101")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "BUG-101"

def test_get_single_issue_not_found(mock_db_connection):
    mock_db_connection.fetchone.return_value = None

    response = client.get("/api/issues/BUG-999")
    assert response.status_code == 404

def test_create_issue(mock_db_connection):
    # First fetchone checks if ID exists (returns None for new ID)
    mock_db_connection.fetchone.return_value = None

    new_issue = {
        "id": "BUG-107",
        "title": "New issue",
        "status": "Open",
        "severity": "Low",
        "date": "2026-03-15",
        "reporter": "Test User",
        "description": "Test description"
    }
    response = client.post("/api/issues", json=new_issue)
    assert response.status_code == 200
    assert response.json()["id"] == "BUG-107"
    
    # Assert execute was called twice (once for SELECT, once for INSERT)
    assert mock_db_connection.execute.call_count == 2
