import base64, io
from fastapi import APIRouter, HTTPException
from PIL import Image

from app.dependencies import get_search_engine
from app.schemas.product import Product
from app.schemas.search_request import SearchRequest
from app.schemas.response import StyleNotesResponse
from app.services.gemini_service import generate_style_notes_batch
from app.services.formatter import build_style_notes_response
from app.services.prompt_service import build_fallback_note

router = APIRouter()


@router.post("/search", response_model=StyleNotesResponse)
def search(payload: SearchRequest):
    if not payload.query_text and not payload.image_base64:
        raise HTTPException(status_code=400, detail="Provide query_text and/or an image")

    image = None
    if payload.image_base64:
        try:
            image = Image.open(io.BytesIO(base64.b64decode(payload.image_base64))).convert("RGB")
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid image data")

    engine = get_search_engine()
    results = engine.discover_fashion(
        text_query=payload.query_text,
        image_query=image,
        filters=payload.filters,
        apply_rerank=payload.apply_rerank,
        top_k=payload.top_k,
    )

    search_mode = "image" if image else "text"

    if not results:
        return build_style_notes_response([], {}, payload.query_text or "", search_mode=search_mode)

    products = [Product(id=r["id"], similarity_score=r["score"], **r["payload"]) for r in results]

    notes_top_k = min(payload.notes_top_k, len(products))
    products_for_notes = products[:notes_top_k]
    remaining_products = products[notes_top_k:]

    style_notes = generate_style_notes_batch(payload.query_text or "", products_for_notes)
    ai_generated_ids = set(style_notes.keys())  # track which are REAL Gemini output

    for p in remaining_products:
        style_notes[p.id] = build_fallback_note(payload.query_text or "", p)

    return build_style_notes_response(
        products=products,
        style_notes=style_notes,
        user_query=payload.query_text or "",
        search_mode=search_mode,
        ai_generated_ids=ai_generated_ids,
    )