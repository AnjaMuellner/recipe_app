from pydantic import BaseModel
from typing import List, Optional, TYPE_CHECKING, Union, Dict
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
    servings: Union[int, Dict[str, int]]  # Allow servings to be an integer or a dictionary
    servings_unit: Unit
    special_equipment: List[str] = []  # Ensure it's always a list of strings
    instructions: str  # JSON object from the frontend
    thumbnail_url: Optional[str] = None
    images_url: Optional[List[str]] = None  # Update to reflect a list of strings
    source: Optional[str] = None
    prep_time: Optional[int] = None
    cook_time: Optional[int] = None
    rest_time: Optional[int] = None
    total_time: Optional[int] = None

class RecipeCreate(RecipeBase):
    thumbnail: Optional[UploadFile] = File(None)
    images: Optional[List[UploadFile]] = File(None)

    class Config:
        from_attributes = True

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
        from_attributes = True

class RecipeResponse(Recipe):
    class Config:
        from_attributes = True