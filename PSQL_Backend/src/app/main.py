import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
import logging

from app.Backend.database import Base, engine
from app.Backend import api_router

UPLOAD_DIR = "uploaded_audio"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Configure logging - used chat gpt to help with this
logging.basicConfig(level=logging.WARNING)

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Log the incoming request
        logging.info(f"Incoming request: {request.method} {request.url}")
        response = await call_next(request)
        # Log the outgoing response
        logging.info(f"Response status: {response.status_code}")
        return response

# Create the FastAPI app
app = FastAPI()

# Initialize the database
@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# Add CORS middleware - used chat gpt to help with this
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Add logging middleware
app.add_middleware(LoggingMiddleware)

# Include the API router
app.include_router(api_router, prefix="")

@app.get("/")
def read_root():
    return {"Hello": "World"}

