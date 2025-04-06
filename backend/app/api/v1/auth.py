import logging
import os
from datetime import timedelta

from pathlib import Path
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, Request
from jose import jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

dotenv_path = Path("c:/Users/Anja/recipe_app/backend/.env")
load_dotenv(dotenv_path=dotenv_path)

from backend.app.models import User
from backend.app.db import get_db
from backend.app.schemas import UserCreate, UserResponseWithToken, UserLogin

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

if not SECRET_KEY:
    raise ValueError("SECRET_KEY is not set. Check your .env file.")

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/register", response_model=UserResponseWithToken)
async def register_user(request: Request, user: UserCreate, db: Session = Depends(get_db)):
    logging.info(f"Received payload: {await request.json()}")
    try:
        # Check if the email is already registered
        db_user = db.query(User).filter(User.email == user.email).first()
        if db_user:
            logging.error("Email already registered")
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Hash the password and create a new user
        hashed_password = get_password_hash(user.password)
        new_user = User(
            username=user.username,
            email=user.email,
            hashed_password=hashed_password
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        logging.info(f"User registered successfully: {user.username}")

        # Create an access token
        access_token = create_access_token(data={"sub": new_user.email})

        # Return the response with the access token
        return UserResponseWithToken(
            id=new_user.id,
            username=new_user.username,
            email=new_user.email,
            access_token=access_token,
            token_type="bearer"
        )
    except Exception as e:
        logging.error(f"Error during registration: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.post("/login")
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    logging.info(f"Login attempt for identifier: {user.identifier}")
    
    # Check if the identifier is an email or username
    if "@" in user.identifier:
        db_user = db.query(User).filter(User.email == user.identifier).first()
    else:
        db_user = db.query(User).filter(User.username == user.identifier).first()
    
    if not db_user:
        logging.error("User not found")
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    if not pwd_context.verify(user.password, db_user.hashed_password):
        logging.error("Invalid password")
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    access_token = create_access_token(
        data={"sub": db_user.email}    
    )
    logging.info(f"User {user.identifier} logged in successfully")
    return {"access_token": access_token, "token_type": "bearer"}