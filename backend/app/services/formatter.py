"""
formatter.py — Response Formatting Utilities
==============================================
Helper functions for building clean, consistent API responses.
These ensure the JSON returned to React is well-structured.
"""

from typing import List, Dict, Optional
from app.schemas.product import Product
from app.schemas.response import ProductWithStyleNote, StyleNotesResponse


def build_product_with_style_note(
    product: Product,
    style_notes: Dict[int, str],
    ai_generated_ids: set,
) -> ProductWithStyleNote:
    style_note = style_notes.get(product.id)
    return ProductWithStyleNote(
        **{f: getattr(product, f) for f in [
            "id", "product_display_name", "article_type", "base_colour",
            "fabric", "fit", "season", "usage", "gender", "brand_name",
            "price", "discounted_price", "image_url", "similarity_score",
        ]},
        style_note=style_note or "No style note generated for this product.",
        ai_note_available=product.id in ai_generated_ids,
    )


def build_style_notes_response(products, style_notes, user_query, search_mode="text", error_message=None, ai_generated_ids=None):
    """
    Builds the complete API response object.

    This is what FastAPI returns to React as JSON.
    """
    ai_generated_ids = ai_generated_ids or set()
    enriched_products = [
        build_product_with_style_note(p, style_notes, ai_generated_ids) for p in products
    ]
    ai_generated = len(ai_generated_ids) > 0
    return StyleNotesResponse(
        products=enriched_products,
        query=user_query,
        total=len(enriched_products),
        ai_generated=ai_generated,
        search_mode=search_mode,
        error_message=error_message,
    )


def format_price_inr(price: Optional[float]) -> str:
    """Format a price value as Indian Rupees string."""
    if price is None:
        return "Price not available"
    return f"₹{price:,.0f}"
