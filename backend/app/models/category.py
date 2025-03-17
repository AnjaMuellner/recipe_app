from sqlalchemy import Column, Integer, String, Table, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.db.base_class import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)

    from backend.app.models.recipe import recipe_categories  # Moved import here
    recipes = relationship("Recipe", secondary=recipe_categories, back_populates="categories")