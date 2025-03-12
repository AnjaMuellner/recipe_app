from pydantic import BaseModel
from typing import Optional
import datetime

class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    pass

class Comment(CommentBase):
    id: int
    user_id: int
    recipe_id: int
    created_at: datetime.datetime

    class Config:
        orm_mode: True