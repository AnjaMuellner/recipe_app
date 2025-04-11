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
        from_attributes = True

class IngredientTranslationBase(BaseModel):
    language: str
    name: str

class IngredientTranslationCreate(IngredientTranslationBase):
    pass

class IngredientTranslation(IngredientTranslationBase):
    id: int
    ingredient_id: int

    class Config:
        from_attributes = True

class IngredientResponse(BaseModel):
    name: str
    quantity: Optional[float] = None
    unit: Optional[str] = None

    class Config:
        from_attributes = True