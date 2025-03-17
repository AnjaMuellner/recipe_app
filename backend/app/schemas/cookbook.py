from datetime import datetime
from pydantic import BaseModel
from typing import TYPE_CHECKING, List, Optional

if TYPE_CHECKING:
    from .user import User
    
class CookbookBase(BaseModel):
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None

class CookbookCreate(CookbookBase):
    pass

class Cookbook(CookbookBase):
    id: int
    created_at: datetime
    members: List['User'] = []
    cookbook_recipes: List['CookbookRecipe'] = []
    chapters: List['CookbookChapter'] = []

    class Config:
        orm_mode: True

class CookbookRecipe(BaseModel):
    id: int
    recipe_id: int
    chapter_id: Optional[int] = None
    position: int
    cookbook_id: int
    created_at: datetime

    class Config:
        orm_mode: True

class CookbookRecipeFeedback(BaseModel):
    id: int
    cookbook_recipe_id: int
    user_id: int
    rating: Optional[float] = None
    comment: Optional[str] = None
    created_at: datetime

    class Config:
        orm_mode: True

class CookbookChapter(BaseModel):
    id: int
    name: str
    position: int
    cookbook_id: int

    class Config:
        orm_mode: True