from pydantic import BaseModel
from typing import List, Optional, TYPE_CHECKING
import datetime

if TYPE_CHECKING:
    from .comment import Comment

class RecipeBase(BaseModel):
    title: str
    ingredients: List[str]
    instructions: str

class RecipeCreate(RecipeBase):
    pass

class Recipe(RecipeBase):
    id: int
    user_id: int
    comments: List['Comment'] = []
    added_at: datetime.datetime
    last_cooked_at: Optional[datetime.datetime] = None
    changed_at: datetime.datetime

    class Config:
        orm_mode: True