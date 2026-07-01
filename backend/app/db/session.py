import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

logger = logging.getLogger(__name__)

# Load database URL from environment or fallback to local SQLite for development
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "sqlite:///./portfolio.db"
)

if DATABASE_URL.startswith("sqlite"):
    # SQLite-specific connection arguments (required for multi-threaded SQLite sessions)
    connect_args = {"check_same_thread": False}
    engine = create_engine(DATABASE_URL, connect_args=connect_args)
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Dependency generator to retrieve database sessions for API requests."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initializes schema tables if they do not exist."""
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
