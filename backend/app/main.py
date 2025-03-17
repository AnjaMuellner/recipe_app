from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import SQLAlchemyError

from backend.app.api.v1 import auth, users
from backend.app.api.v1.auth import router as auth_router
from backend.app.api.v1.recipes import router as recipes_router
from backend.app.db.init_db import init_db

# Initialize the database
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Initializing database...")
    init_db()
    yield
    print("Shutting down...")

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:3000", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request, exc):
    """
    Handle SQLAlchemy exceptions and return a JSON response.

    Args:
        request: The request that caused the exception.
        exc (SQLAlchemyError): The exception raised by SQLAlchemy.
    """
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
    )

@app.get("/")
def read_root():
    return {"message": "Welcome!"}

@app.get("/test-cors")
def test_cors():
    return {"message": "CORS is working!"}

app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api", tags=["users"])
app.include_router(recipes_router, prefix="/api")