import os
import shutil
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, status, UploadFile, File
from sqlalchemy.orm import Session

load_dotenv()

from backend.app.models import User, Recipe
from backend.app.db import get_db
from backend.app.schemas import RecipeResponse
from backend.app.utils import get_current_user

router = APIRouter()

@router.get("/recipes", response_model=List[RecipeResponse])
def read_recipes(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    recipes = db.query(Recipe).filter(Recipe.owner_id == current_user.id).all()
    return recipes

@router.post("/recipes", response_model=RecipeResponse, status_code=status.HTTP_201_CREATED)
def create_recipe(
    title: str,
    ingredients: dict,
    instructions: dict,
    thumbnail: Optional[UploadFile] = File(None),
    images: Optional[List[UploadFile]] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    uploads_dir = "uploads"
    if not os.path.exists(uploads_dir):
        os.makedirs(uploads_dir)

    thumbnail_url = None
    images_url = {}

    if thumbnail:
        thumbnail_path = os.path.join(uploads_dir, thumbnail.filename)
        with open(thumbnail_path, "wb") as buffer:
            shutil.copyfileobj(thumbnail.file, buffer)
        thumbnail_url = thumbnail_path

    if images:
        for index, image in enumerate(images):
            image_path = os.path.join(uploads_dir, image.filename)
            with open(image_path, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)
            images_url[f"image_{index}"] = image_path

    db_recipe = Recipe(
        title=title,
        ingredients=ingredients,
        instructions=instructions,
        thumbnail_url=thumbnail_url,
        images_url=images_url,
        owner_id=current_user.id
    )
    db.add(db_recipe)
    db.commit()
    db.refresh(db_recipe)
    return db_recipe