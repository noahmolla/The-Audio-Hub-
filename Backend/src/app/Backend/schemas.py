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

#Test schemas
class A_Route_Inputs(BaseModel):
    name: constr(min_length=5, max_length=20)
    last_name: constr(min_length=5, max_length=20)

class Return_A_Route():
    name_r = ""
    last_name_r = ""
    def __init__(self, param1, param2):
        self.last_name_r = param1
        self.name_r = param2

#Schemas for user operations
class UserCreateInput(BaseModel):
    user_name: constr(min_length=3, max_length=40)
    email: EmailStr
    password: constr(min_length=8, max_length=64)

class UpdateUserName(BaseModel):
    user_name: constr(min_length=3, max_length=40)

class UpdateEmail(BaseModel):
    email: EmailStr

class UpdatePassword(BaseModel):
    password: constr(min_length=8, max_length=64)

class ConfirmUser(BaseModel):
    user_name: constr(min_length=3, max_length=40)
    password: constr(min_length=8, max_length=64)

#Schemas for audio operations
class AudioCreateInput(BaseModel):
    audio_name: constr(min_length=3, max_length=40)
    file_path: str