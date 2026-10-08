"""
prompt_service.py — Prompt Engineering
=========================================
Builds the prompts that are sent to Gemini.
This is one of the most important parts of backend's module.

Key principles:
1. Only use information from the product metadata — NO hallucination
2. Keep instructions clear and specific
3. Request structured JSON output for reliable parsing
4. Handle both single and batch product prompts
"""

from typing import List
from app.schemas.product import Product
from app.services.metadata_service import format_metadata_for_prompt


# ─── System Instruction ──────────────────────────────────────────────────────
# This tells Gemini what role it's playing and what rules to follow

SYSTEM_INSTRUCTION = """You are an AI fashion stylist for a fashion e-commerce platform.

Your job is to explain the relevance of each retrieved product to the user's search query.

STRICT RULES:
1. Use ONLY information explicitly present in the provided product metadata.
2. Never invent, assume, or infer product properties that are not provided.
3. First identify the important attributes in the user's query, such as category, color, fabric, fit, season, gender, usage, or style.
4. Prioritize those matching attributes when writing the note.
5. Mention specific product attributes from the metadata that support the match.
6. If the product only partially matches the query, clearly state the attributes that do match instead of pretending it is an exact match.
7. Do not mention attributes that are irrelevant to the user's query unless they help explain the recommendation.
8. Do not make claims about comfort, quality, durability, breathability, warmth, occasion suitability, or performance unless explicitly present in the metadata.
9. Keep each note to 1-2 concise sentences.
10. Do not repeat the user's query unnecessarily.
11. Write naturally, like a knowledgeable fashion shopping assistant.
12. Every product must receive a note.
13. Return ONLY valid JSON. Do not return markdown, explanations, or additional text."""


def build_batch_prompt(user_query: str, products: List[Product]) -> str:

    product_blocks = []

    for i, product in enumerate(products, 1):
        metadata_text = format_metadata_for_prompt(product)

        product_blocks.append(
            f"""PRODUCT {i}
ID: {product.id}
METADATA:
{metadata_text}"""
        )

    products_section = "\n\n".join(product_blocks)

    expected_ids = ", ".join(str(p.id) for p in products)

    prompt = f"""USER SEARCH QUERY:
"{user_query}"

PRODUCTS:
{products_section}

TASK:

For every product, write one concise style note explaining its relevance to the user's search query.

Follow this process for each product:
1. Identify the key requirements in the user's query.
2. Compare those requirements with the product metadata.
3. Mention the strongest matching attributes.
4. If only some requirements match, describe only those supported matches.
5. Never invent missing attributes.

The note should sound useful to a shopper, not like a database description.

Example:

Query:
"black casual shirt"

Good note:
"This black shirt matches the requested color and shirt category, making it a relevant option for the search."

Bad note:
"This comfortable and stylish shirt is perfect for casual outings."

The bad example is incorrect because comfort and suitability were not provided in the metadata.

Return exactly one note for every product ID.

REQUIRED JSON FORMAT:
{{
  "products": [
    {{
      "id": 123,
      "style_note": "..."
    }}
  ]
}}

PRODUCT IDs THAT MUST BE INCLUDED:
{expected_ids}
"""

    return prompt

def build_single_product_prompt(user_query: str, product: Product) -> str:
    """
    Builds a prompt for a single product.
    Used as fallback when batch processing fails.
    """

    metadata_text = format_metadata_for_prompt(product)

    prompt = f"""USER'S SEARCH QUERY: "{user_query}"

RETRIEVED PRODUCT (ID: {product.id}):
{metadata_text}

TASK:
Write a concise explanation (1-3 sentences) of why this product matches the user's search query.
Reference only the provided product attributes — do NOT invent features.

REQUIRED JSON FORMAT (return ONLY this JSON, nothing else):
{{
  "id": {product.id},
  "style_note": "<your_explanation_here>"
}}"""

    return prompt


def build_fallback_note(user_query: str, product: Product) -> str:
    parts = []

    if product.article_type:
        parts.append(f"This {product.article_type.lower()}")
    else:
        parts.append("This item")

    attributes = []
    if product.base_colour:
        attributes.append(f"its {product.base_colour.lower()} color")
    if product.fit:
        attributes.append(f"{product.fit.lower()} fit")
    if product.fabric:
        attributes.append(f"{product.fabric.lower()} material")
    if product.season:
        attributes.append(f"suitability for {product.season.lower()}")

    if attributes:
        parts.append("was retrieved based on " + ", ".join(attributes))
    else:
        parts.append("was retrieved as a relevant match")

    parts.append("for your search.")
    return " ".join(parts)
