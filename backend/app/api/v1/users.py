from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from backend.app.db import get_db
from backend.app.models import User as UserModel
from backend.app.schemas import UserResponse
from backend.app.utils import get_current_user

router = APIRouter()

@router.get("/users/me", response_model=UserResponse)
def get_current_user_profile(current_user: UserModel = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
    }