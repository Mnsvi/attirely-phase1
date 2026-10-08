"""
metadata_service.py — Product Metadata Extraction
====================================================
Extracts and structures product metadata from Product objects,
using the real Qdrant payload field names.
"""

from typing import Dict, Any
from app.schemas.product import Product

# (product attribute name, prompt label) — "category" and "color" etc.
# are prompt-facing labels only; the source attribute is the real one.
FIELD_MAP = [
    ("article_type", "Category"),   # most specific of the 3 hierarchy fields
    ("base_colour", "Color"),
    ("fabric", "Material"),
    ("fit", "Fit"),
    ("season", "Season"),
    ("usage", "Usage"),              # real field, wasn't in the original list
    ("gender", "Gender"),
    ("brand_name", "Brand"),
]


def extract_product_metadata(product: Product) -> Dict[str, Any]:
    """
    Returns a clean dict for prompt construction.
    Only includes fields that actually have values.
    """
    metadata = {"id": product.id, "title": product.product_display_name}

    for attr_name, label in FIELD_MAP:
        value = getattr(product, attr_name, None)
        if value and str(value).strip():
            metadata[label.lower()] = value

    price = product.discounted_price if product.discounted_price is not None else product.price
    if price is not None:
        metadata["price"] = price

    if product.description:
        metadata["description"] = product.description

    return metadata


def format_metadata_for_prompt(product: Product) -> str:
    """
    Formats product metadata as a readable text block for the prompt.
    """
    lines = [f"Title: {product.product_display_name}"]

    for attr_name, label in FIELD_MAP:
        value = getattr(product, attr_name, None)
        if value and str(value).strip():
            lines.append(f"{label}: {value}")

    price = product.discounted_price if product.discounted_price is not None else product.price
    if price is not None:
        lines.append(f"Price: ₹{price:,.0f}")

    if product.description and product.description.strip():
        lines.append(f"Description: {product.description}")

    return "\n".join(lines)


def extract_all_products_metadata(products: list) -> list:
    return [extract_product_metadata(p) for p in products]


def get_available_attributes(product: Product) -> list:
    available = [label.lower() for attr_name, label in FIELD_MAP if getattr(product, attr_name, None)]
    return available