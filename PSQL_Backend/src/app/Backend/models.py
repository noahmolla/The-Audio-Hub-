#External Imports
from datetime import datetime, timedelta, timezone
from sqlalchemy import Boolean, Column, Integer, String, DateTime, LargeBinary
from sqlalchemy.sql import func


#Internal Imports
from app.Backend.database import Base

#User DB Model
class DBUsers(Base):
    __tablename__ = "Users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_name = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    is_verified = Column(Boolean, default=True)
    verification_code = Column(String, nullable=True)
    verification_code_expiry = datetime.now(timezone.utc) + timedelta(minutes=10)
    # Expiration time for verification code

#Audio DB Model
class DBAudio(Base):
    __tablename__ = "Audio"

    track_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, index=True)
    audio_name = Column(String, index=True)
    created_at = Column(String, index=True)
    file_path = Column(String, index=True)
    file_data = Column(LargeBinary)
