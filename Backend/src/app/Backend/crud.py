#External Imports
from fastapi import APIRouter, Depends, HTTPException, status, Header  # Import Header to accept Authorization header
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
from app.Backend.models import DBUsers, DBAudio
from app.Backend.schemas import A_Route_Inputs, Return_A_Route, UserCreateInput, UpdateUserName, UpdateEmail, UpdatePassword, ConfirmUser, AudioCreateInput
from app.Backend.auth import create_access_token, generate_verification_code, send_verification_email, decode_access_token
from app.core.config import settings
from app.schemas.token import Token
from app.Backend.database import Base, get_db

#verification code libraries
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

#Secret Key Settings
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
#Actual Routes
@router.post("/make_user")
def make_new_user(new_user: UserCreateInput, db : Session = Depends(get_db)):
    existing_user = db.query(DBUsers).filter(DBUsers.user_name == new_user.user_name).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken")

    existing_email = db.query(DBUsers).filter(DBUsers.email == new_user.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already taken")

    # Generate verification code
    verification_code = generate_verification_code()

    user_save = DBUsers(
        user_name=new_user.user_name,
        email=new_user.email,
        password_hash=pwd_context.hash(new_user.password),
        created_at=time.strftime("%H:%M:%S", time.localtime()),
        is_verified=False,
        verification_code=verification_code,
        verification_code_expiry=datetime.now(timezone.utc) + timedelta(minutes=10)  # Set expiration time to 10 minutes from now
    )

    send_verification_email(new_user.email, verification_code)

    #if not pwd_context.verify(new_user.password, user_save.password_hash):
    #    raise HTTPException(status_code=401, detail="Incorrect password")

    db.add(user_save)
    db.commit()
    db.refresh(user_save)
    return user_save

@router.put("/user/verify")
def verify_user(user_name: str, verification_code: str, db: Session = Depends(get_db)):
    try:
        # Validate input
        if not user_name or not verification_code:
            raise HTTPException(status_code=400, detail="Username and verification code are required")

        # Query the database
        selected_user = db.query(DBUsers).filter(DBUsers.user_name == user_name).first()
        if not selected_user:
            raise HTTPException(status_code=404, detail="User not found")

        # Verify the code
        if selected_user.verification_code == str(verification_code):
            if datetime.now(timezone.utc) < selected_user.verification_code_expiry:
                selected_user.is_verified = True
                db.commit()
                db.refresh(selected_user)
                return {"detail": "User verified successfully"}
            else:
                raise HTTPException(status_code=400, detail="Verification code expired, please request a new one")
        else:
            raise HTTPException(status_code=400, detail="Invalid verification code")
    except Exception as e:
        print(f"Error verifying user: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.put("/user/verify/newcoderequest")
def request_new_verification_code(username: str, db: Session = Depends(get_db)):
    # Query the database to find the user by username
    selected_user = db.query(DBUsers).filter(DBUsers.user_name == username).first()
    if not selected_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if selected_user.is_verified:
        raise HTTPException(status_code=400, detail="User already verified")
    
    # Generate a new verification code
    verification_code = generate_verification_code()
    selected_user.verification_code = verification_code
    selected_user.verification_code_expiry = datetime.now(timezone.utc) + timedelta(minutes=10)  # Set expiration time to 10 minutes from now

    # Send the verification email
    send_verification_email(selected_user.email, verification_code)

    # Commit the changes to the database
    db.commit()
    db.refresh(selected_user)
    
    return {"detail": "New verification code sent to email"}


@router.get("/user")
def get_user_by_token(token: str = Header(...), db: Session = Depends(get_db)):
    token_data = decode_access_token(token)
    user_id = token_data.username

    sample_user = db.query(DBUsers).filter(DBUsers.user_name == user_id).first()
    if not sample_user:
        raise HTTPException(status_code=404, detail="User not found")
    return sample_user


@router.put("/user/update")
def update_user_info(up_user: UserCreateInput, token: str = Header(...), db: Session = Depends(get_db)):
    token_data = decode_access_token(token)
    user_id = token_data.username

    selected_user = db.query(DBUsers).filter(DBUsers.user_name == user_id).first()
    if not selected_user:
        raise HTTPException(status_code=404, detail="User not found")

    existing_user = db.query(DBUsers).filter(DBUsers.user_name == up_user.user_name).first()
    if existing_user and existing_user.id != selected_user.id:
        raise HTTPException(status_code=400, detail="Username already taken")

    existing_email = db.query(DBUsers).filter(DBUsers.email == up_user.email).first()
    if existing_email and existing_email.id != selected_user.id:
        raise HTTPException(status_code=400, detail="Email already taken")

    selected_user.user_name = up_user.user_name
    selected_user.email = up_user.email
    selected_user.password_hash = pwd_context.hash(up_user.password)

    db.commit()
    db.refresh(selected_user)

    return selected_user


@router.delete("/user/delete")
def delete_user(token: str = Header(...), db: Session = Depends(get_db)):
    token_data = decode_access_token(token)
    user_id = token_data.username

    user_to_delete = db.query(DBUsers).filter(DBUsers.user_name == user_id).first()
    if not user_to_delete:
        raise HTTPException(status_code=404, detail="User not found")

    name = user_to_delete.user_name
    user_to_delete_id = user_to_delete.id
    db.delete(user_to_delete)
    db.commit()

    audio_records_to_delete = db.query(DBAudio).filter(DBAudio.user_id == user_to_delete_id).all()
    for audio_record in audio_records_to_delete:
        db.delete(audio_record)
        db.commit()

    return {"detail": f"User: {name}, was deleted successfully!"}


@router.get("/audio/temp_view")
def get_user_audio_temp_view(token: str = Header(...), db: Session = Depends(get_db)):
    token_data = decode_access_token(token)
    user_id = token_data.username

    sample_user = db.query(DBAudio).filter(DBAudio.user_id == user_id).first()
    if not sample_user:
        raise HTTPException(status_code=404, detail="No Audio")
    return sample_user


@router.put("/user/update/username")
def update_username(up_user: UpdateUserName, token: str = Header(...), db: Session = Depends(get_db)):
    token_data = decode_access_token(token)
    user_id = token_data.username

    selected_user = db.query(DBUsers).filter(DBUsers.user_name == user_id).first()
    if not selected_user:
        raise HTTPException(status_code=404, detail="User not found")

    existing_user = db.query(DBUsers).filter(DBUsers.user_name == up_user.user_name).first()
    if existing_user and existing_user.id != selected_user.id:
        raise HTTPException(status_code=400, detail="Username already taken")

    selected_user.user_name = up_user.user_name

    db.commit()
    db.refresh(selected_user)

    return selected_user.user_name


@router.put("/user/update/password")
def update_password(user_name: int, up_user: UpdatePassword, db: Session = Depends(get_db)):
    selected_user = db.query(DBUsers).filter(DBUsers.user_name == user_name).first()
    if not selected_user:
        raise HTTPException(status_code=404, detail="User not found")

    selected_user.password = pwd_context.hash(up_user.password)

    db.commit()
    db.refresh(selected_user)

    return "Password updated for " + selected_user.user_name


@router.put("/user/update/email")
def update_email(up_user: UpdateEmail, token: str = Header(...), db: Session = Depends(get_db)):
    token_data = decode_access_token(token)
    user_id = token_data.username

    selected_user = db.query(DBUsers).filter(DBUsers.user_name == user_id).first()
    if not selected_user:
        raise HTTPException(status_code=404, detail="User not found")

    existing_email = db.query(DBUsers).filter(DBUsers.email == up_user.email).first()
    if existing_email and existing_email.id != selected_user.id:
        raise HTTPException(status_code=400, detail="Email already taken")

    selected_user.email = up_user.email

    db.commit()
    db.refresh(selected_user)

    return {"detail": f"Email updated for {selected_user.user_name}"}


@router.post("/user/confirm")
def confirm_user(attempt_user: ConfirmUser, db: Session = Depends(get_db)):
    attempted_user = db.query(DBUsers).filter(DBUsers.user_name == attempt_user.user_name).first()
    if not attempted_user:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    if not pwd_context.verify(attempt_user.password, attempted_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    return attempted_user


@router.post("/audio/create")
def user_create_audio(audio_input: AudioCreateInput, token: str = Header(...), db: Session = Depends(get_db)):
    token_data = decode_access_token(token)
    user_id = token_data.username

    attempted_user = db.query(DBUsers).filter(DBUsers.user_name == user_id).first()
    if not attempted_user:
        raise HTTPException(status_code=404, detail="User not found")

    user_audios = db.query(DBAudio).filter(DBAudio.user_id == attempted_user.id).all()

    for audio_file in user_audios:
        if audio_file.audio_name == audio_input.audio_name:
            raise HTTPException(status_code=400, detail="Audio name already used")

    audio_save = DBAudio(
        user_id=attempted_user.id,
        audio_name=audio_input.audio_name,
        created_at=time.strftime("%H:%M:%S", time.localtime()),
        file_path=audio_input.file_path
    )

    db.add(audio_save)
    db.commit()
    db.refresh(audio_save)
    return audio_save


@router.get("/audio/get_audios")
def user_get_all_audio(token: str = Header(...), db: Session = Depends(get_db)):
    token_data = decode_access_token(token)
    if not token_data:
        raise HTTPException(status_code=401, detail="Invalid token")
    user_id = token_data.username
    #print(user_id)
    #get the user id based on username
    #attempted_user = db.query(DBUsers).filter(DBUsers.user_name == user_id).first()
    sample_user = db.query(DBUsers).filter(DBUsers.user_name == user_id).first()
    audio_records = db.query(DBAudio).filter(DBAudio.user_id == sample_user.id).all()
    return audio_records


@router.put("/audio/update/{audio_id}")
def update_audio(audio_id: int, audio_input: AudioCreateInput, db: Session = Depends(get_db)):
    selected_audio = db.query(DBAudio).filter(DBAudio.track_id == audio_id).first()
    if not selected_audio:
        raise HTTPException(status_code=404, detail="Audio not found")

    all_user_audios = db.query(DBAudio).filter(DBAudio.user_id == selected_audio.user_id).all()

    for user_audio in all_user_audios:
        if user_audio.track_id != selected_audio.track_id:
            if user_audio.audio_name == audio_input.audio_name:
                raise HTTPException(status_code=400, detail="Audio name already used")

    selected_audio.audio_name = audio_input.audio_name
    selected_audio.file_path = audio_input.file_path

    db.commit()
    db.refresh(selected_audio)
    return selected_audio

@router.delete("/audio/delete/{audio_id}")
def delete_audio(audio_id: int, db: Session = Depends(get_db)):
    audio_to_delete = db.query(DBAudio).filter(DBAudio.track_id == audio_id).first()
    if not audio_to_delete:
        raise HTTPException(status_code=404, detail="Audio not found with provided id")
    name = audio_to_delete.audio_name
    db.delete(audio_to_delete)
    db.commit()

    test_delete = db.query(DBAudio).filter(DBAudio.track_id == audio_id).first()
    if not test_delete:
        return "Audio file: " + name + ", was deleted successfully!"

    return "Audio file: " +  name + ", was not deleted"

@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # Authenticate user
    user = db.query(DBUsers).filter(DBUsers.user_name == form_data.username).first()
    if not user or not pwd_context.verify(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Generate access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.user_name}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/user/exists")
def check_user_exists(username: str, db: Session = Depends(get_db)):
    # Query the database to check if the user exists
    user_exists = db.query(DBUsers).filter(DBUsers.user_name == username).first()
    
    # Return true if the user exists, otherwise false
    return {"exists": bool(user_exists)}







