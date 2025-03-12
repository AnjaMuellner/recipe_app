from pydantic import BaseModel
from typing import List, Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from .recipe import Recipe
    from .comment import Comment

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class User(UserBase):
    id: int
    recipes: List['Recipe'] = []
    comments: List['Comment'] = []

    class Config:
        orm_mode: True

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    recipes: List['Recipe'] = []
    comments: List['Comment'] = []

    class Config:
        orm_mode: True