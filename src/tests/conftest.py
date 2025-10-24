"""
Test configuration and fixtures
"""
import pytest
import os
from dotenv import load_dotenv
from supabase import create_client

@pytest.fixture(scope="session")
def test_db():
    """Create test database connection"""
    # Load test environment variables
    load_dotenv(".env.test", override=True)
    
    # Create test client
    supabase = create_client(
        os.getenv("SUPABASE_URL"),
        os.getenv("SUPABASE_KEY")
    )
    
    return supabase

@pytest.fixture(autouse=True)
async def setup_teardown(test_db):
    """Setup before and cleanup after each test"""
    # Setup: You can add any pre-test setup here
    yield
    
    # Teardown: Clean up test data
    # Add cleanup code here if needed
    pass