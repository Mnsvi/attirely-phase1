"""
request.py — API Request Schema
=================================
Defines what backend expects to receive.
This is the contract between ml model and backend.

ml model sends:
{
    "user_query": "black oversized hoodie for winter",
    "products": [ { ...product metadata... } ]
}

backend validates this with Pydantic before processing.
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from .product import Product


class StyleNotesRequest(BaseModel):
    """
    The request body for POST /api/style-notes.

    ml model calls this endpoint after retrieving
    relevant products using CLIP/retrieval.
    """

    user_query: str = Field(
        ...,
        description="The original user search query (text or image description)",
        min_length=1,
        examples=["black oversized hoodie for winter"]
    )

    products: List[Product] = Field(
        ...,
        description="List of products retrieved by ml model",
        min_length=1,
        examples=[[
            {
                "id": 102,
                "title": "Oversized Cotton Hoodie",
                "category": "Hoodie",
                "color": "Black",
                "material": "Cotton",
                "fit": "Oversized",
                "season": "Winter",
                "price": 1499,
                "image_url": "https://example.com/image.jpg"
            }
        ]]
    )

    search_mode: Optional[str] = Field(
        "text",
        description="Search mode: 'text' or 'image'",
        examples=["text", "image"]
    )

    class Config:
        json_schema_extra = {
            "example": {
                "user_query": "black oversized hoodie for winter",
                "search_mode": "text",
                "products": [
                    {
                        "id": 102,
                        "title": "Oversized Cotton Hoodie",
                        "category": "Hoodie",
                        "color": "Black",
                        "material": "Cotton",
                        "fit": "Oversized",
                        "season": "Winter",
                        "price": 1499,
                        "image_url": "https://images.pexels.com/photos/1437796/pexels-photo-1437796.jpeg"
                    }
                ]
            }
        }


class MockSearchRequest(BaseModel):
    """
    Request for the mock search endpoint.
    Used for development when ml model is not available.
    """

    query: str = Field(
        ...,
        description="User's text search query",
        min_length=1
    )

    top_k: Optional[int] = Field(
        6,
        description="Number of mock products to return",
        ge=1,
        le=20
    )
