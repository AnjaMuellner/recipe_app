from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from backend.app.models import User
from backend.app.schemas.user import UserResponse
from backend.app.db import get_db

router = APIRouter()

@router.get("/users", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users