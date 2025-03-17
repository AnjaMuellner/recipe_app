from datetime import datetime
import enum
from sqlalchemy import JSON, CheckConstraint, Column, DateTime, Enum, Float, ForeignKey, Integer, String, Table, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from backend.app.db.base_class import Base
from backend.app.models.recipe import recipe_categories
from backend.app.models.user import cookbook_users

class Cookbook(Base):
    __tablename__ = "cookbooks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)  #Thumbnail
    created_at = Column(DateTime, default=datetime.utcnow)

    members = relationship("User", secondary=cookbook_users, back_populates="cookbooks")
    cookbook_recipes = relationship("CookbookRecipe", back_populates="cookbook")
    chapters = relationship("CookbookChapter", back_populates="cookbook")

class CookbookRecipe(Base):
    __tablename__ = "cookbook_recipes"

    id = Column(Integer, primary_key=True, index=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False)
    chapter_id = Column(Integer, ForeignKey("cookbook_chapters.id"), nullable=True)
    position = Column(Integer, nullable=False)  #Position in Chapter
    cookbook_id = Column(Integer, ForeignKey("cookbooks.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    recipe = relationship("Recipe", back_populates="cookbook_recipes")
    chapter = relationship("CookbookChapter", back_populates="recipes")
    cookbook = relationship("Cookbook", back_populates="cookbook_recipes")
    feedback = relationship("CookbookRecipeFeedback", back_populates="cookbook_recipe")


class CookbookRecipeFeedback(Base):
    __tablename__ = "cookbook_recipe_feedback"

    id = Column(Integer, primary_key=True, index=True)
    cookbook_recipe_id = Column(Integer, ForeignKey("cookbook_recipes.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Float, CheckConstraint("rating >= 1 AND rating <= 5"), nullable=True)  #Rating (1-5) or NULL if only comment
    comment = Column(Text, nullable=True)  #Comment or NULL if only rating
    created_at = Column(DateTime, default=datetime.utcnow)

    cookbook_recipe = relationship("CookbookRecipe", back_populates="feedback")
    user = relationship("User", back_populates="feedback")


class CookbookChapter(Base):
    __tablename__ = "cookbook_chapters"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    position = Column(Integer, nullable=False)  #Position in Cookbook
    cookbook_id = Column(Integer, ForeignKey("cookbooks.id"), nullable=False)

    cookbook = relationship("Cookbook", back_populates="chapters")
    recipes = relationship("CookbookRecipe", back_populates="chapter")