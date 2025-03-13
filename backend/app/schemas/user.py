from pydantic import BaseModel, EmailStr
from typing import List, Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from .recipe import Recipe
    from .comment import Comment

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class User(BaseModel):
    id: int
    recipes: List['Recipe'] = []
    comments: List['Comment'] = []

    class Config:
        orm_mode = True

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr

    class Config:
        orm_mode = True