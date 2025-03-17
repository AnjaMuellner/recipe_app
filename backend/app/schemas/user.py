from pydantic import BaseModel, EmailStr
from typing import List, TYPE_CHECKING

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        orm_mode: True
