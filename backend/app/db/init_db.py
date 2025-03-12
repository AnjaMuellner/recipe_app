from sqlalchemy import create_engine
from backend.app.db.base_class import Base
from backend.app.db.session import engine

def init_db():
    Base.metadata.create_all(bind=engine)