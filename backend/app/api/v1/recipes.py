from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from dotenv import load_dotenv

load_dotenv()

from backend.app.models import User, Recipe
from backend.app.db import get_db
from backend.app.schemas import RecipeResponse, RecipeCreate, TokenData
from backend.app.utils import get_current_user

router = APIRouter()

@router.get("/recipes", response_model=List[RecipeResponse])
def read_recipes(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    recipes = db.query(Recipe).filter(Recipe.owner_id == current_user.id).all()
    return recipes

@router.post("/recipes", response_model=RecipeResponse, status_code=status.HTTP_201_CREATED)
def create_recipe(recipe: RecipeCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_recipe = Recipe(**recipe.dict(), owner_id=current_user.id)
    db.add(db_recipe)
    db.commit()
    db.refresh(db_recipe)
    return db_recipe