from sqlalchemy import Column, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from backend.app.db.base_class import Base
from backend.app.models.recipe import recipe_ingredients

class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False, index=True)
    language = Column(String(20), nullable=False)

    recipes = relationship(
        "Recipe",
        secondary=recipe_ingredients,
        back_populates="ingredients"
    )
    translations = relationship("IngredientTranslation", back_populates="ingredient", foreign_keys="[IngredientTranslation.ingredient_id]")
    creator = relationship("User", back_populates="ingredients")

class IngredientTranslation(Base):
    __tablename__ = "ingredient_translations"

    id = Column(Integer, primary_key=True, index=True)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id"), nullable=False)
    language = Column(String(20), nullable=False)  #Z.B. "en", "de", "fr"
    name = Column(String(255), nullable=False, index=True)

    ingredient = relationship("Ingredient", back_populates="translations", foreign_keys="[IngredientTranslation.ingredient_id]")