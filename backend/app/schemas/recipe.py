from pydantic import BaseModel
from typing import List, Optional, TYPE_CHECKING
from datetime import datetime
from fastapi import UploadFile, File
from .category import Category
from .shared_recipe import SharedRecipe
from .cookbook import CookbookRecipe
from .user import User
from .ingredient import IngredientResponse
from enum import Enum

class Unit(str, Enum):
    NUMBER = "number"
    SPRINGFORM = "springform"
    BAKING_TRAY = "baking tray"

class RecipeBase(BaseModel):
    title: str
    ingredients: List[IngredientResponse]
    servings: int
    servings_unit: Unit
    special_equipment: Optional[dict] = None  # JSON object from the frontend
    instructions: str  # JSON object from the frontend
    thumbnail_url: Optional[str] = None
    images_url: Optional[dict] = None
    source: Optional[str] = None
    prep_time: Optional[int] = None
    cook_time: Optional[int] = None
    rest_time: Optional[int] = None
    total_time: Optional[int] = None

class RecipeCreate(RecipeBase):
    thumbnail: Optional[UploadFile] = File(None)
    images: Optional[List[UploadFile]] = File(None)

class Recipe(RecipeBase):
    id: int
    added_at: datetime
    changed_at: datetime
    owner_id: int
    original_id: Optional[int] = None
    owner: User
    original: Optional['Recipe'] = None
    copies: List['Recipe'] = []
    categories: List[Category] = []
    shared_recipes: List[SharedRecipe] = []
    cookbook_recipes: List[CookbookRecipe] = []

    class Config:
        orm_mode: True

class RecipeResponse(Recipe):
    pass