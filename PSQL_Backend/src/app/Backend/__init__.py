from fastapi import APIRouter

from app.Backend import crud

api_router = APIRouter()
api_router.include_router(crud.router, prefix="/auth", tags=["User"])