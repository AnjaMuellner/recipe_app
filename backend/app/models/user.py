from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from backend.app.db.base_class import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    recipes = relationship("Recipe", back_populates="user")
    comments = relationship("Comment", back_populates="user")