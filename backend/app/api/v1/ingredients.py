import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List

from backend.app.models import Ingredient, IngredientTranslation, User, Recipe
from backend.app.schemas import IngredientCreate, Ingredient as IngredientSchema, IngredientTranslationCreate, IngredientTranslation as IngredientTranslationSchema, IngredientResponse
from backend.app.db import get_db
from backend.app.utils import load_predefined_ingredients, get_current_user

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/ingredients", response_model=List[IngredientSchema])
def get_all_ingredients(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Fetch all ingredients from the database
    ingredients = db.query(Ingredient).options(joinedload(Ingredient.translations)).all()

    # Convert ingredients to a dictionary format with translations
    ingredients_data = [
        {
            "id": ingredient.id,
            "name": ingredient.name,
            "language": ingredient.language,
            "creator_id": ingredient.creator_id,
            "translations": [
                {"id": t.id, "name": t.name, "language": t.language, "ingredient_id": ingredient.id} for t in ingredient.translations
            ]
        }
        for ingredient in ingredients
    ]

    return ingredients_data

@router.post("/ingredients", response_model=IngredientSchema)
def create_ingredient(ingredient: IngredientCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_ingredient = Ingredient(**ingredient.dict(), creator_id=current_user.id)
    db.add(db_ingredient)
    db.commit()
    db.refresh(db_ingredient)
    return db_ingredient

@router.post("/ingredients/{ingredient_id}/translations", response_model=IngredientTranslationSchema)
def add_translation(ingredient_id: int, translation: IngredientTranslationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Fetch the ingredient from the database
    ingredient = db.query(Ingredient).filter(Ingredient.id == ingredient_id).first()

    if not ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")

    # Add the translation to the database
    db_translation = IngredientTranslation(**translation.dict(), ingredient_id=ingredient.id)
    db.add(db_translation)
    db.commit()
    db.refresh(db_translation)
    return db_translation

@router.delete("/ingredients/{ingredient_id}", status_code=204)
def delete_ingredient(ingredient_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Fetch the ingredient
    ingredient = db.query(Ingredient).filter(Ingredient.id == ingredient_id).first()
    
    if not ingredient:
        logger.error(f"Ingredient with ID {ingredient_id} not found.")
        raise HTTPException(status_code=404, detail="Ingredient not found")
    
    # Check if the ingredient is used in any recipe
    try:
        recipes_using_ingredient = db.query(Recipe).filter(Recipe.ingredients.any(id=ingredient_id)).count()
    except Exception as e:
        logger.error(f"Error checking recipes for ingredient {ingredient_id}: {e}")
        raise HTTPException(status_code=500, detail="Error checking ingredient usage in recipes")
    
    if recipes_using_ingredient > 0:
        raise HTTPException(status_code=400, detail="Ingredient is used in a recipe and cannot be deleted")
    
    # Delete related translations
    try:
        db.query(IngredientTranslation).filter(IngredientTranslation.ingredient_id == ingredient_id).delete()
        db.commit()
    except Exception as e:
        logger.error(f"Error deleting translations for ingredient {ingredient_id}: {e}")
        raise HTTPException(status_code=500, detail="Error deleting related translations")
    
    # Allow deletion of predefined ingredients if not used in recipes
    if ingredient.creator_id is None or ingredient.creator_id == current_user.id:
        try:
            db.delete(ingredient)
            db.commit()
            logger.info(f"Ingredient with ID {ingredient_id} deleted successfully.")
            return
        except Exception as e:
            logger.error(f"Error deleting ingredient {ingredient_id}: {e}")
            raise HTTPException(status_code=500, detail="Error deleting ingredient")
    
    logger.warning(f"User {current_user.id} attempted to delete ingredient {ingredient_id} without permission.")
    raise HTTPException(status_code=403, detail="You do not have permission to delete this ingredient")

@router.delete("/ingredients/{ingredient_id}/translations/{translation_id}", status_code=204)
def delete_translation(
    ingredient_id: int,
    translation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch the translation
    translation = db.query(IngredientTranslation).join(Ingredient).filter(
        IngredientTranslation.id == translation_id,
        IngredientTranslation.ingredient_id == ingredient_id,
        Ingredient.creator_id == current_user.id
    ).first()

    if not translation:
        raise HTTPException(status_code=404, detail="Translation not found or not owned by the user")

    # Check if the translation is used in any recipe
    try:
        recipes_using_translation = db.query(Recipe).filter(
            Recipe.ingredients.any(id=ingredient_id)
        ).count()
    except Exception as e:
        logger.error(f"Error checking recipes for translation {translation_id}: {e}")
        raise HTTPException(status_code=500, detail="Error checking translation usage in recipes")

    if recipes_using_translation > 0:
        raise HTTPException(status_code=400, detail="Translation is used in a recipe and cannot be deleted")

    # Delete the translation
    try:
        db.delete(translation)
        db.commit()
        logger.info(f"Translation with ID {translation_id} deleted successfully.")
        return
    except Exception as e:
        logger.error(f"Error deleting translation {translation_id}: {e}")
        raise HTTPException(status_code=500, detail="Error deleting translation")