from sqlalchemy import JSON, Column, Integer, String, DateTime, ForeignKey, Table, Enum, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.app.db.base_class import Base
import enum

class Unit(enum.Enum):
    NUMBER = "number"
    SPRINGFORM = "springform"
    BAKING_TRAY = "baking tray"

recipe_ingredients = Table(
    "recipe_ingredients",
    Base.metadata,
    Column("recipe_id", Integer, ForeignKey("recipes.id"), primary_key=True),
    Column("ingredient_id", Integer, ForeignKey("ingredients.id"), primary_key=True),
    Column("quantity", Float, nullable=True),
    Column("unit", String(25), nullable=True),
)

recipe_categories = Table(
    "recipe_categories",
    Base.metadata,
    Column("recipe_id", Integer, ForeignKey("recipes.id"), primary_key=True),
    Column("category_id", Integer, ForeignKey("categories.id"), primary_key=True),
)

class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    servings = Column(JSON, nullable=True, index=True)
    servings_unit = Column(Enum(Unit), index=True)
    special_equipment = Column(JSON, nullable=True, index=True)
    instructions = Column(String, nullable=False, index=True)

    thumbnail_url = Column(String(255), nullable=True, index=True)
    images_url = Column(JSON, nullable=True, index=True)
    source = Column(String(255), nullable=True, index=True)

    prep_time = Column(Integer, nullable=True, index=True) #In minutes
    cook_time = Column(Integer, nullable=True, index=True) #In minutes
    rest_time = Column(Integer, nullable=True, index=True) #In minutes
    total_time = Column(Integer, nullable=True, index=True) #In minutes

    added_at = Column(DateTime, default=datetime.utcnow, index=True)
    changed_at = Column(DateTime, default=datetime.utcnow, index=True)

    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    original_id = Column(Integer, ForeignKey("recipes.id", ondelete="SET NULL"), nullable=True) #If Copy of another recipe

    owner = relationship("User", back_populates="recipes")
    ingredients = relationship(
        "Ingredient",
        secondary=recipe_ingredients,
        back_populates="recipes"
    )
    original = relationship("Recipe", remote_side=[id], back_populates="copies")
    copies = relationship("Recipe", back_populates="original")
    categories = relationship("Category", secondary=recipe_categories, back_populates="recipes")
    shared_recipes = relationship("SharedRecipe", back_populates="recipe")
    cookbook_recipes = relationship("CookbookRecipe", back_populates="recipe")