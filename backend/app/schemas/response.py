"""
response.py — API Response Schema
===================================
Defines what returns after Gemini generates style notes.
returns:
{
    "products": [
        {
            "id": 102,
            "title": "Oversized Cotton Hoodie",
            "price": 1499,
            "image_url": "...",
            "category": "Hoodie",
            "color": "Black",
            "fit": "Oversized",
            "season": "Winter",
            "style_note": "This hoodie matches your search because..."
        }
    ],
    "query": "black oversized hoodie for winter",
    "total": 1,
    "ai_generated": true
}
"""

from pydantic import BaseModel, Field
from typing import List, Optional


class ProductWithStyleNote(BaseModel):
    id: int
    product_display_name: Optional[str] = None
    article_type: Optional[str] = None
    base_colour: Optional[str] = None
    fabric: Optional[str] = None
    fit: Optional[str] = None
    season: Optional[str] = None
    usage: Optional[str] = None
    gender: Optional[str] = None
    brand_name: Optional[str] = None
    price: Optional[float] = None
    discounted_price: Optional[float] = None
    image_url: Optional[str] = None
    similarity_score: Optional[float] = None
    style_note: Optional[str] = Field(None, description="AI-generated explanation")
    ai_note_available: bool = Field(True, description="Whether AI generation succeeded")


class StyleNotesResponse(BaseModel):
    """
    The complete response from POST /api/style-notes.
    Contains all products enriched with AI style notes.
    """

    products: List[ProductWithStyleNote] = Field(
        ...,
        description="Products with AI-generated style notes"
    )

    query: str = Field(
        ...,
        description="The original user search query"
    )

    total: int = Field(
        ...,
        description="Total number of products returned"
    )

    ai_generated: bool = Field(
        True,
        description="Whether AI style notes were successfully generated"
    )

    search_mode: Optional[str] = Field(
        "text",
        description="Search mode used: text or image"
    )

    error_message: Optional[str] = Field(
        None,
        description="Error message if something went wrong (partial failure)"
    )


class HealthResponse(BaseModel):
    """Response for the health check endpoint."""
    status: str
    gemini_configured: bool
    version: str = "1.0.0"
    message: str


class MockSearchResponse(BaseModel):
    """Response from the mock search endpoint."""
    user_query: str
    products: list
    total: int
    source: str = "mock"
