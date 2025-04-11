from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.exc import SQLAlchemyError
from starlette.middleware.base import BaseHTTPMiddleware

from backend.app.api.v1 import users
from backend.app.api.v1.auth import router as auth_router
from backend.app.api.v1.recipes import router as recipes_router
from backend.app.api.v1.ingredients import router as ingredients_router
from backend.app.db.init_db import init_db

import os

FRONTEND_BASE_URL = os.getenv("FRONTEND_BASE_URL")

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
    allow_origins=[FRONTEND_BASE_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LogRequestMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        content_type = request.headers.get("content-type", "")
        if "multipart/form-data" in content_type:
            print("Incoming request with multipart/form-data")
        else:
            body = await request.body()
            print("Incoming request data:", body.decode("utf-8", errors="replace"))  # Use 'replace' to avoid crashes
        response = await call_next(request)
        return response

# Add middleware to log incoming requests
app.add_middleware(LogRequestMiddleware)

# Mount the uploads directory as a static files route
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

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
app.include_router(recipes_router, prefix="/api", tags=["recipes"])
app.include_router(ingredients_router, prefix="/api", tags=["ingredients"])