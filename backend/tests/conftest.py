import os
import sys
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add backend root to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.db.session import Base, get_db
from app.core.security import create_access_token

# Use in-memory SQLite for isolated tests
TEST_DATABASE_URL = "sqlite:///./test_sahayak.db"
test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=test_engine)
    # Seed test database
    from seed_data import seed
    sess = TestingSessionLocal()
    try:
        seed(sess)
    finally:
        sess.close()
    yield
    Base.metadata.drop_all(bind=test_engine)
    test_engine.dispose()
    if os.path.exists("./test_sahayak.db"):
        try:
            os.remove("./test_sahayak.db")
        except Exception:
            pass


@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def student_auth_headers():
    token = create_access_token(subject="std-1", role="student")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def claimant_auth_headers():
    token = create_access_token(subject="std-3", role="student")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def finder_auth_headers():
    token = create_access_token(subject="std-5", role="student")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_auth_headers():
    token = create_access_token(subject="usr_admin_1", role="admin")
    return {"Authorization": f"Bearer {token}"}
