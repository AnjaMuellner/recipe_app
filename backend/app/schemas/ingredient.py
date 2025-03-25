from pydantic import BaseModel
from typing import List, Optional

class IngredientBase(BaseModel):
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
    pass

class IngredientTranslation(IngredientTranslationBase):
    id: int
    ingredient_id: int

    class Config:
        orm_mode: True

class IngredientResponse(IngredientBase):
    id: int
    creator_id: int

    class Config:
        orm_mode: True