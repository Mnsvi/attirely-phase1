from functools import lru_cache
from app.services.search_engine import SearchEngine
from app.config.settings import settings

@lru_cache
def get_search_engine() -> SearchEngine:
    return SearchEngine(qurl=settings.QDRANT_URL, api=settings.QDRANT_API_KEY)