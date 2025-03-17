from pydantic import BaseModel
from typing import List, Optional

class IngredientBase(BaseModel):
    amount: Optional[float] = None
    unit: Optional[str] = None
    name: str
    language: str

class IngredientCreate(IngredientBase):
    pass

class Ingredient(IngredientBase):
    id: int
    creator_id: int
    translations: List['IngredientTranslation'] = []

    class Config:
        orm_mode: True

class IngredientTranslationBase(BaseModel):
    language: str
    name: str

class IngredientTranslationCreate(IngredientTranslationBase):
    ingredient_id: int

class IngredientTranslation(IngredientTranslationBase):
    id: int
    ingredient_id: int

    class Config:
        orm_mode: True