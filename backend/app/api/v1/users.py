from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from backend.app.db import get_db
from backend.app.models import User as UserModel
from backend.app.schemas import UserResponse

router = APIRouter()

