from pydantic import BaseModel
from typing import List

class IngredientBase(BaseModel):
    default_translation_id: int
    creator_id: int

class IngredientCreate(IngredientBase):
    pass

class Ingredient(IngredientBase):
    id: int
    translations: List['IngredientTranslation'] = []

    class Config:
        orm_mode: True

class IngredientTranslation(BaseModel):
    id: int
    ingredient_id: int
    language: str
    name: str

    class Config:
        orm_mode: True