from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.models import Ingredient, IngredientTranslation, User
from backend.app.schemas import IngredientCreate, Ingredient as IngredientSchema, IngredientTranslationCreate, IngredientTranslation as IngredientTranslationSchema
from backend.app.db import get_db
from backend.app.utils import load_predefined_ingredients, get_current_user

router = APIRouter()

@router.get("/predefined-ingredients")
def get_predefined_ingredients(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    predefined_ingredients = load_predefined_ingredients("c:/Users/Anja/recipe_app/backend/ingredients.json")
    user_ingredients = db.query(Ingredient).filter(Ingredient.creator_id == current_user.id).all()
    
    return {
        "predefined_ingredients": predefined_ingredients,
        "user_ingredients": user_ingredients
    }

@router.post("/ingredients", response_model=IngredientSchema)
def create_ingredient(ingredient: IngredientCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_ingredient = Ingredient(**ingredient.dict(), creator_id=current_user.id)
    db.add(db_ingredient)
    db.commit()
    db.refresh(db_ingredient)
    return db_ingredient

@router.post("/ingredients/{ingredient_id}/translations", response_model=IngredientTranslationSchema)
def add_translation(ingredient_id: int, translation: IngredientTranslationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Check if the ingredient is predefined or user-added
    predefined_ingredients = load_predefined_ingredients("c:/Users/Anja/recipe_app/backend/ingredients.json")
    ingredient = db.query(Ingredient).filter(Ingredient.id == ingredient_id).first()
    
    if not ingredient:
        ingredient = next((ing for ing in predefined_ingredients if ing["id"] == ingredient_id), None)
        if not ingredient:
            raise HTTPException(status_code=404, detail="Ingredient not found")

    db_translation = IngredientTranslation(**translation.dict(), ingredient_id=ingredient_id)
    db.add(db_translation)
    db.commit()
    db.refresh(db_translation)
    return db_translation