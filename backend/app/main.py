from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.dependencies import get_search_engine
from app.routers import search, health
from app.config.settings import settings

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def warm_up():
    get_search_engine()

app.include_router(search.router)
app.include_router(health.router)
