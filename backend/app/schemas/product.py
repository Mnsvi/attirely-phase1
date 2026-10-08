"""
product.py — Product Pydantic Schema
======================================
Canonical product shape — mirrors the actual Qdrant payload fields
exactly (see data-prep/scripts/load_to_qdrant.py's PAYLOAD_FIELDS
and docs/api-contract.md). This is the ONE Product schema used
everywhere in the backend — the /products/{id} route, retrieval
results, and the Gemini pipeline all use this same class, so there's
no second invented shape to drift out of sync with reality again.

`id` is the Qdrant point ID, not part of the payload itself, so it's
supplied separately when constructing a Product from a retrieved point.

`similarity_score` is not stored data — it only exists on products
that came back from a search, set after retrieval, not part of the
stored payload.
"""

from pydantic import BaseModel, Field
from typing import Optional


class Product(BaseModel):
    """
    Represents a single fashion product, sourced directly from the
    Qdrant collection's payload fields.
    """

    # Required — always present
    id: int = Field(..., description="Qdrant point ID / product ID")

    # Core identity — matches product_display_name / brand_name in payload
    product_display_name: Optional[str] = Field(None, description="Product name/title")
    brand_name: Optional[str] = Field(None, description="Brand name")

    # Category hierarchy — three real fields, not one invented 'category'
    master_category: Optional[str] = Field(None, description="Top-level category e.g. Apparel, Footwear")
    sub_category: Optional[str] = Field(None, description="Sub-category e.g. Topwear, Shoes")
    article_type: Optional[str] = Field(None, description="Specific article type e.g. Tshirts, Casual Shoes")

    gender: Optional[str] = Field(None, description="Target gender e.g. Men, Women, Unisex")
    base_colour: Optional[str] = Field(None, description="Primary colour of the product")
    season: Optional[str] = Field(None, description="Season suitability e.g. Winter, Summer")
    usage: Optional[str] = Field(None, description="Usage context e.g. Casual, Formal, Sports")
    year: Optional[int] = Field(None, description="Product year")

    # Pricing
    price: Optional[float] = Field(None, description="Product price in INR (₹)")
    discounted_price: Optional[float] = Field(None, description="Discounted price in INR (₹)")

    # Content
    description: Optional[str] = Field(None, description="Cleaned free-text product description")
    image_url: Optional[str] = Field(None, description="URL of the product image")

    # Optional attributes — sparse, may be None for most products
    pattern: Optional[str] = Field(None, description="Pattern e.g. Solid, Printed")
    fabric: Optional[str] = Field(None, description="Fabric/material e.g. Cotton, Polyester")
    sleeve_length: Optional[str] = Field(None, description="Sleeve length, where applicable")
    occasion: Optional[str] = Field(None, description="Occasion e.g. Casual, Party")
    fit: Optional[str] = Field(None, description="Fit type e.g. Slim, Regular, Oversized")
    neck: Optional[str] = Field(None, description="Neck style, where applicable")
    length: Optional[str] = Field(None, description="Length, where applicable")

    # Retrieval-time only — not stored, set after a search
    similarity_score: Optional[float] = Field(None, description="Retrieval similarity/fusion score")

    class Config:
        extra = "allow"  # tolerate unexpected payload keys without crashing