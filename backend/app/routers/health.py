from fastapi import APIRouter, Response
from app.dependencies import get_search_engine

router = APIRouter()


@router.get("/health")
def health(response: Response):
    checks = {"models_loaded": False, "qdrant_connected": False}

    try:
        engine = get_search_engine()
        checks["models_loaded"] = True
    except Exception:
        response.status_code = 503
        return {"status": "unhealthy", **checks}

    try:
        engine.client.get_collections()
        checks["qdrant_connected"] = True
    except Exception:
        pass

    healthy = all(checks.values())
    response.status_code = 200 if healthy else 503
    return {"status": "ok" if healthy else "degraded", **checks}
