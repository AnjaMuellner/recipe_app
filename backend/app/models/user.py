from sqlalchemy import Column, Integer, String, Table, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.db.base_class import Base

cookbook_users = Table(
    "cookbook_users",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("cookbook_id", Integer, ForeignKey("cookbooks.id"), primary_key=True),
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    recipes = relationship("Recipe", back_populates="owner")
    shared_recipes = relationship("SharedRecipe", back_populates="user")
    cookbooks = relationship("Cookbook", secondary=cookbook_users, back_populates="members")
    feedback = relationship("CookbookRecipeFeedback", back_populates="user")
    ingredients = relationship("Ingredient", back_populates="creator")