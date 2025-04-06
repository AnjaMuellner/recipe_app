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

@router.get("/predefined-ingredients")
def get_predefined_ingredients(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    predefined_ingredients = load_predefined_ingredients("c:/Users/Anja/recipe_app/backend/ingredients.json")
    
    # Fetch translations for predefined ingredients from the database
    predefined_ingredient_ids = [ing["id"] for ing in predefined_ingredients]
    predefined_translations = db.query(IngredientTranslation).filter(
        IngredientTranslation.ingredient_id.in_(predefined_ingredient_ids)
    ).all()
    
    # Map translations from the database to their respective predefined ingredients
    predefined_translations_map = {}
    for translation in predefined_translations:
        if translation.ingredient_id not in predefined_translations_map:
            predefined_translations_map[translation.ingredient_id] = []
        predefined_translations_map[translation.ingredient_id].append({
            "id": translation.id,
            "name": translation.name,
            "language": translation.language
        })
    
    # Merge JSON translations with database translations
    for ingredient in predefined_ingredients:
        json_translations = [
            {"name": name, "language": lang}
            for lang, name in ingredient.get("translations", {}).items()
        ]
        db_translations = predefined_translations_map.get(ingredient["id"], [])
        ingredient["translations"] = json_translations + db_translations

    # Eagerly load translations for user-added ingredients
    user_ingredients = db.query(Ingredient).options(joinedload(Ingredient.translations)).filter(
        Ingredient.creator_id == current_user.id
    ).all()
    
    # Convert user ingredients to a dictionary format with translations
    user_ingredients_data = [
        {
            "id": ingredient.id,
            "name": ingredient.name,
            "language": ingredient.language,
            "translations": [
                {"id": t.id, "name": t.name, "language": t.language} for t in ingredient.translations
            ]
        }
        for ingredient in user_ingredients
    ]

    return {
        "predefined_ingredients": predefined_ingredients,
        "user_ingredients": user_ingredients_data
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
        # If the ingredient is predefined, create a new database entry for it
        predefined_ingredient = next((ing for ing in predefined_ingredients if ing["id"] == ingredient_id), None)
        if not predefined_ingredient:
            logger.debug(f"Ingredient with id {ingredient_id} not found in predefined ingredients.")
            raise HTTPException(status_code=404, detail="Ingredient not found")
        
        # Add the predefined ingredient to the database
        ingredient = Ingredient(
            id=predefined_ingredient["id"],
            name=predefined_ingredient["name"],
            language=predefined_ingredient["language"],
            creator_id=current_user.id  # Associate it with the current user
        )
        db.add(ingredient)
        db.commit()
        db.refresh(ingredient)

    # Add the translation to the database
    db_translation = IngredientTranslation(**translation.dict(), ingredient_id=ingredient.id)
    db.add(db_translation)
    db.commit()
    db.refresh(db_translation)
    return db_translation

@router.delete("/ingredients/{ingredient_id}", status_code=204)
def delete_ingredient(ingredient_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Fetch the ingredient
    ingredient = db.query(Ingredient).filter(Ingredient.id == ingredient_id, Ingredient.creator_id == current_user.id).first()
    
    if not ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found or not owned by the user")
    
    # Check if the ingredient is used in any recipe
    recipes_using_ingredient = db.query(Recipe).filter(Recipe.ingredients.contains({str(ingredient_id): {}})).count()
    if recipes_using_ingredient > 0:
        raise HTTPException(status_code=400, detail="Ingredient is used in a recipe and cannot be deleted")
    
    # Delete the ingredient
    db.delete(ingredient)
    db.commit()
    return

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
    recipes_using_translation = db.query(Recipe).filter(
        Recipe.ingredients.contains({str(ingredient_id): {"name": translation.name}})
    ).count()

    if recipes_using_translation > 0:
        raise HTTPException(status_code=400, detail="Translation is used in a recipe and cannot be deleted")

    # Delete the translation
    db.delete(translation)
    db.commit()
    return