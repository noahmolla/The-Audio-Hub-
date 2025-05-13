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
from app.core.config import settings
from app.schemas.token import Token
from app.Backend.database import Base, get_db
from app.schemas.token import TokenData
from jwt import InvalidTokenError

#verification code libraries
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

#Secret Key Settings
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

#JWT Access token
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.now(UTC) + (
        expires_delta if expires_delta else timedelta(minutes=15)
    )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> TokenData:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return TokenData(username=username)
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

#Email User Verification
def generate_verification_code():
    import random
    
    code = random.randint(100000, 999999) #6 digit code random

    return code

def send_verification_email(to_email, code):
    message = Mail(
        from_email='loraha4821@sdsu.edu',
        to_emails=to_email,
        subject='Your Verification Code',
        plain_text_content=f'Your code is: {code}'
    )

    try:
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)  # api key to send the email
        response = sg.send(message)
        return response.status_code
    except Exception as e:
        print(str(e))
        return None