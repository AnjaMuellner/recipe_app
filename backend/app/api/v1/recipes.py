import os
import shutil
import json
import logging
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, status, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session, joinedload  # Add joinedload to the imports

load_dotenv()

from backend.app.db import get_db
from backend.app.models import User, Recipe as RecipeModel, Ingredient, recipe_ingredients
from backend.app.schemas import RecipeResponse
from backend.app.utils import get_current_user

router = APIRouter()

logger = logging.getLogger(__name__)

base_url = os.getenv("API_BASE_URL")

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
            "thumbnail_url": recipe.thumbnail_url,  # Include thumbnail_url
            "images_url": recipe.images_url or [],  # Include images_url as a list
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

@router.get("/recipes/{recipe_id}", response_model=RecipeResponse)
def get_recipe(recipe_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    recipe = db.query(RecipeModel).filter(RecipeModel.id == recipe_id, RecipeModel.owner_id == current_user.id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    # Fetch ingredients with quantity and unit for the recipe
    ingredients = db.execute(
        recipe_ingredients.select().where(recipe_ingredients.c.recipe_id == recipe.id)
    ).fetchall()

    # Include the owner details in the response
    owner = db.query(User).filter(User.id == recipe.owner_id).first()

    return {
        "id": recipe.id,
        "title": recipe.title,
        "servings": recipe.servings,  # Return servings as-is
        "servings_unit": recipe.servings_unit,
        "special_equipment": recipe.special_equipment or [],  # Ensure it's always a list
        "instructions": recipe.instructions,
        "prep_time": recipe.prep_time,
        "cook_time": recipe.cook_time,
        "rest_time": recipe.rest_time,
        "total_time": recipe.total_time,
        "thumbnail_url": recipe.thumbnail_url,
        "images_url": recipe.images_url or [],  # Ensure images_url is returned as a list
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
        "owner_id": recipe.owner_id,
        "owner": {
            "id": owner.id,
            "username": owner.username,
            "email": owner.email
        }
    }

@router.post("/recipes", response_model=RecipeResponse, status_code=status.HTTP_201_CREATED)
def create_recipe(
    title: str = Form(...),
    ingredients: str = Form(...),  # JSON string with name, quantity, and unit
    instructions: str = Form(...),  # Treat instructions as a plain string
    servings: str = Form(...),  # Expect servings as a JSON string
    servings_unit: str = Form(None),
    special_equipment: Optional[str] = Form(None),  # Expect a JSON string from the frontend
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
    except json.JSONDecodeError as e:
        logger.error(f"JSON decoding error: {e}")
        raise HTTPException(
            status_code=400,
            detail="Invalid JSON format in ingredients"
        )

    try:
        servings = json.loads(servings)  # Parse servings as JSON
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format in servings")

    try:
        special_equipment = json.loads(special_equipment) if special_equipment else []
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format in special_equipment")

    # Ensure special_equipment is a list of strings and preserve the order
    special_equipment = [item.strip() for item in special_equipment if item.strip()]

    # Validate and fetch ingredients from the database
    if not ingredients:
        raise HTTPException(
            status_code=400,
            detail="Ingredients field cannot be empty."
        )

    # Normalize ingredient names from the request
    ingredient_names = [ingredient['name'].strip().lower() for ingredient in ingredients if 'name' in ingredient]
    if not ingredient_names:
        raise HTTPException(
            status_code=400,
            detail="At least one ingredient with a valid name is required."
        )

    # Fetch and normalize predefined ingredient names and translations from the database
    db_ingredients = db.query(Ingredient).options(joinedload(Ingredient.translations)).all()
    db_ingredient_map = {ingredient.name.strip().lower(): ingredient for ingredient in db_ingredients}

    # Include translations in the validation map
    for ingredient in db_ingredients:
        for translation in ingredient.translations:
            db_ingredient_map[translation.name.strip().lower()] = ingredient

    # Debugging: Log predefined ingredients and translations
    logger.info(f"Predefined ingredients and translations in database: {list(db_ingredient_map.keys())}")

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
        servings=servings,  # Store servings as JSON
        servings_unit=servings_unit,
        special_equipment=special_equipment,  # Store as a JSON list
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
        normalized_name = ingredient['name'].strip().lower()
        db.execute(
            recipe_ingredients.insert().values(
                recipe_id=db_recipe.id,
                ingredient_id=db_ingredient_map[normalized_name].id,
                quantity=ingredient.get('quantity'),
                unit=ingredient.get('unit')
            )
        )

    # Ensure the uploads directory exists
    uploads_dir = "uploads"

    thumbnail_url = None
    if thumbnail:
        thumbnail_path = os.path.join(uploads_dir, thumbnail.filename)
        with open(thumbnail_path, "wb") as f:
            shutil.copyfileobj(thumbnail.file, f)
        thumbnail_url = f"/uploads/{thumbnail.filename}"  # Use relative path for the thumbnail URL
    db_recipe.thumbnail_url = thumbnail_url

    image_urls = []
    if images:
        for image in images:
            image_path = os.path.join(uploads_dir, image.filename)
            with open(image_path, "wb") as f:
                shutil.copyfileobj(image.file, f)
            image_urls.append(f"{base_url}/{image_path.replace(os.sep, '/')}")
    db_recipe.images_url = image_urls

    db.commit()
    db.refresh(db_recipe)
    logger.info(f"Recipe created successfully: {db_recipe.title}")
    return db_recipe

@router.delete("/recipes/{recipe_id}", status_code=204)
def delete_recipe(recipe_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    recipe = db.query(RecipeModel).filter(RecipeModel.id == recipe_id).first()

    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    if recipe.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have permission to delete this recipe")

    try:
        db.delete(recipe)
        db.commit()
        return
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error deleting recipe")