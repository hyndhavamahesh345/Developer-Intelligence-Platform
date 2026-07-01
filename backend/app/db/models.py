import datetime
import uuid
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, Text, BigInteger
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base

# Wrapper to support UUID column types dynamically on SQLite and PostgreSQL
UUID_TYPE = String(36)

class SessionModel(Base):
    """Logs visitor interaction sessions."""
    __tablename__ = "sessions"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    visitor_ip = Column(String(45), nullable=True) # Anonymized visitor IP
    user_agent = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class MessageModel(Base):
    """Stores full chat history and routing telemetry."""
    __tablename__ = "messages"
    
    id = Column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True)
    session_id = Column(String(36), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False)
    sender = Column(String(10), nullable=False) # 'visitor' or 'agent'
    content = Column(Text, nullable=False)
    routed_to = Column(String(50), nullable=True) # The specialized agent node that generated this
    latency_ms = Column(Integer, nullable=True) # Pipeline latency telemetry
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class FeedbackModel(Base):
    """Stores user thumbs-up/down feedback and reviews."""
    __tablename__ = "feedback"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    message_id = Column(BigInteger().with_variant(Integer, "sqlite"), ForeignKey("messages.id", ondelete="CASCADE"), nullable=False)
    rating = Column(Integer, nullable=False) # 1 = Upvote, -1 = Downvote
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
