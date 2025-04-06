from pydantic import BaseModel, EmailStr
from typing import List, TYPE_CHECKING

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    identifier: str
    password: str

class UserBase(BaseModel):
    username: str
    email: str

class User(UserBase):
    id: int

    class Config:
        from_attributes = True

class UserResponse(UserBase):
    id: int

    class Config:
        orm_mode: True

class UserResponseWithToken(UserResponse):
    access_token: str
    token_type: str