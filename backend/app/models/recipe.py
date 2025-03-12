from sqlalchemy import JSON, Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
import datetime
from backend.app.db.base_class import Base

class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    ingredients = Column(JSON, index=True)
    instructions = Column(String, index=True)
    thumbnail_url = Column(String, index=True)
    images_url = Column(String, index=True)
    prep_time = Column(Integer, index=True)
    cook_time = Column(Integer, index=True)
    waiting_time = Column(Integer, index=True)
    servings = Column(Integer, index=True)
    added_at = Column(DateTime, index=True)
    last_cooked_at = Column(DateTime, index=True)
    changed_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    source = Column(String, index=True)
    special_equipment = Column(String, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), index=True)
    comments = relationship("Comment", back_populates="recipe")
    user = relationship("User", back_populates="recipes")