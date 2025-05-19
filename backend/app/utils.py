import logging
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from starlette.status import HTTP_401_UNAUTHORIZED
from dotenv import load_dotenv
import os
import json
from passlib.context import CryptContext

from backend.app.models import User
from backend.app.schemas import TokenData
from backend.app.db import get_db

load_dotenv(r"C:\Users\Anja\recipe_app\backend\.env")

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY is not set or invalid. Check your .env file.")
logging.info("Loaded SECRET_KEY successfully.")

ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password using passlib's CryptContext."""
    return pwd_context.verify(plain_password, hashed_password)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        logging.info("Received token: %s", token)
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        logging.info("Decoded payload: %s", payload)
        email: str = payload.get("sub")
        if email is None:
            logging.warning("Token payload does not contain 'sub'")
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError as e:
        logging.error("JWT decoding error: %s", e)
        raise credentials_exception
    user = db.query(User).filter(User.email == token_data.email).first()
    if user is None:
        logging.warning("No user found for email: %s", token_data.email)
        raise credentials_exception
    logging.info("Authenticated user: %s", user.username)
    return user

def load_predefined_ingredients(filepath: str):
    with open(filepath, 'r', encoding='utf-8') as file:
        return json.load(file)