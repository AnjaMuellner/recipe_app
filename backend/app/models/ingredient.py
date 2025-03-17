from datetime import datetime
import enum
from sqlalchemy import JSON, CheckConstraint, Column, DateTime, Enum, Float, ForeignKey, Integer, String, Table, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from backend.app.db.base_class import Base

class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True)
    default_translation_id = Column(Integer, ForeignKey("ingredient_translations.id"), nullable=True)  
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    translations = relationship("IngredientTranslation", back_populates="ingredient", foreign_keys="[IngredientTranslation.ingredient_id]")
    creator = relationship("User")


class IngredientTranslation(Base):
    __tablename__ = "ingredient_translations"

    id = Column(Integer, primary_key=True, index=True)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id"), nullable=False)
    language = Column(String(20), nullable=False)  # "en", "de", "fr"
    name = Column(String(255), nullable=False, index=True)

    ingredient = relationship("Ingredient", back_populates="translations", foreign_keys="[IngredientTranslation.ingredient_id]")

    __table_args__ = (UniqueConstraint("ingredient_id", "language", name="uq_ingredient_language"),)