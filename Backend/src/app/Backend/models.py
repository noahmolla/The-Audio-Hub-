#External Imports
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, constr, EmailStr, Field, FilePath
from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.orm import Session
import time
from datetime import datetime, timedelta, UTC
import jwt
from passlib.context import CryptContext
from datetime import timezone

#Imports from other files
from app.Backend.auth import create_access_token, generate_verification_code, send_verification_email
from app.core.config import settings
from app.schemas.token import Token
from app.Backend.database import Base, get_db

#verification code libraries
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

#User DB Model
class DBUsers(Base):
    __tablename__ = "Users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_name = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    created_at = Column(String, index=True)

    is_verified = Column(Boolean, default=True)
    verification_code = Column(String, nullable=True)
    verification_code_expiry = Column(String, nullable=True)  # Expiration time for verification code

#Audio DB Model
class DBAudio(Base):
    __tablename__ = "Audio"

    track_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, index=True)
    audio_name = Column(String, index=True)
    created_at = Column(String, index=True)
    file_path = Column(String, index=True)

