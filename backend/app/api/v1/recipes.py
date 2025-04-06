import os
import shutil
import json
import logging
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, status, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session

load_dotenv()

from backend.app.db import get_db
from backend.app.models import User, Recipe as RecipeModel, Ingredient, recipe_ingredients
from backend.app.schemas import RecipeResponse
from backend.app.utils import get_current_user

router = APIRouter()

logger = logging.getLogger(__name__)

@router.get("/recipes", response_model=List[RecipeResponse])
def read_recipes(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    recipes = db.query(RecipeModel).filter(RecipeModel.owner_id == current_user.id).all()
    recipe_data = []

    for recipe in recipes:
        # Fetch ingredients with quantity and unit for the recipe
        ingredients = db.execute(
            recipe_ingredients.select().where(recipe_ingredients.c.recipe_id == recipe.id)
        ).fetchall()

        # Ensure servings_unit has a default value if None
        servings_unit = recipe.servings_unit or 'number'

        # Transform instructions into a dictionary if it is a list
        instructions = {"steps": recipe.instructions} if isinstance(recipe.instructions, list) else recipe.instructions

        # Build the response data
        recipe_data.append({
            "id": recipe.id,
            "title": recipe.title,
            "servings": recipe.servings,
            "servings_unit": servings_unit,
            "special_equipment": recipe.special_equipment,
            "instructions": instructions,
            "prep_time": recipe.prep_time,
            "cook_time": recipe.cook_time,
            "rest_time": recipe.rest_time,
            "total_time": recipe.total_time,
            "ingredients": [
                {
                    "name": db.query(Ingredient).get(ingredient.ingredient_id).name,
                    "quantity": ingredient.quantity,
                    "unit": ingredient.unit
                }
                for ingredient in ingredients
            ],
            "added_at": recipe.added_at,
            "changed_at": recipe.changed_at,
            "owner_id": current_user.id,  # Set owner_id to the currently logged-in user
            "owner": {
                "id": current_user.id,
                "username": current_user.username,
                "email": current_user.email
            }  # Set owner details to the currently logged-in user
        })

    return recipe_data

@router.post("/recipes", response_model=RecipeResponse, status_code=status.HTTP_201_CREATED)
def create_recipe(
    title: str = Form(...),
    ingredients: str = Form(...),  # JSON string with name, quantity, and unit
        instructions: str = Form(...),  # Treat instructions as a plain string
    servings: Optional[int] = Form(None),
    servings_unit: Optional[str] = Form(None),
    special_equipment: Optional[List[str]] = Form(None),
    source: Optional[str] = Form(None),
    prep_time: Optional[int] = Form(None),
    cook_time: Optional[int] = Form(None),
    rest_time: Optional[int] = Form(None),
    thumbnail: Optional[UploadFile] = File(None),
    images: Optional[List[UploadFile]] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    logger.info(f"Creating recipe with title: {title}")
    try:
        # Parse JSON strings into Python objects
        ingredients = json.loads(ingredients)
        special_equipment = json.loads(special_equipment) if special_equipment else []
    except json.JSONDecodeError as e:
        logger.error(f"JSON decoding error: {e}")
        raise HTTPException(
            status_code=400,
            detail="Invalid JSON format in ingredients or special_equipment"
        )

    if special_equipment is None:
        special_equipment = []

    # Validate and fetch ingredients from the database
    if not ingredients:
        raise HTTPException(
            status_code=400,
            detail="Ingredients field cannot be empty."
        )

    ingredient_names = [ingredient['name'] for ingredient in ingredients if 'name' in ingredient]
    if not ingredient_names:
        raise HTTPException(
            status_code=400,
            detail="At least one ingredient with a valid name is required."
        )

    db_ingredients = db.query(Ingredient).filter(Ingredient.name.in_(ingredient_names)).all()
    db_ingredient_map = {ingredient.name: ingredient for ingredient in db_ingredients}

    # Check for invalid ingredients
    invalid_ingredients = [name for name in ingredient_names if name not in db_ingredient_map]
    if invalid_ingredients:
        logger.warning(f"Invalid ingredients: {invalid_ingredients}")
        raise HTTPException(
            status_code=400,
            detail=f"The following ingredients are not valid: {', '.join(invalid_ingredients)}"
        )

    # Calculate total_time
    total_time = sum(filter(None, [prep_time, cook_time, rest_time]))

    # Create the recipe in the database
    db_recipe = RecipeModel(
        title=title,
        instructions=instructions,
        servings=servings,
        servings_unit=servings_unit,
        special_equipment=special_equipment,
        source=source,
        prep_time=prep_time,
        cook_time=cook_time,
        rest_time=rest_time,
        total_time=total_time,
        owner_id=current_user.id
    )
    db.add(db_recipe)
    db.commit()

    # Add ingredients with optional quantity and unit to the recipe
    for ingredient in ingredients:
        db.execute(
            recipe_ingredients.insert().values(
                recipe_id=db_recipe.id,
                ingredient_id=db_ingredient_map[ingredient['name']].id,
                quantity=ingredient.get('quantity'),
                unit=ingredient.get('unit')
            )
        )

    db.commit()
    db.refresh(db_recipe)
    logger.info(f"Recipe created successfully: {db_recipe.title}")
    return db_recipe