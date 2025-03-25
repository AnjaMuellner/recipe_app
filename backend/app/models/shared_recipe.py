from datetime import datetime
from sqlalchemy import Column, DateTime, Enum, Float, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import relationship
from backend.app.db.base_class import Base

class SharedRecipe(Base):
    __tablename__ = "shared_recipes"

    id = Column(Integer, primary_key=True, index=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    recipe = relationship("Recipe", back_populates="shared_recipes")
    user = relationship("User", back_populates="shared_recipes")

    __table_args__ = (UniqueConstraint("recipe_id", "user_id", name="uq_shared_recipe"),)