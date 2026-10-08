"""
gemini_service.py — Gemini API Integration
============================================
This is the service that actually calls the Gemini API.
All Gemini interactions go through this file.

KEY SECURITY RULE:
The GEMINI_API_KEY is only read here, server-side.
It is NEVER sent to the React frontend.
React → FastAPI → Gemini (key stays on server)

Flow:
1. Receive a prompt string
2. Send it to Gemini
3. Parse the JSON response
4. Return structured data
5. Handle all errors gracefully
"""

import json
import re
import logging
from typing import List, Dict, Optional

from google import genai
from google.genai import types

from app.config.settings import settings
from app.schemas.product import Product
from app.services.prompt_service import (
    SYSTEM_INSTRUCTION,
    build_batch_prompt,
    build_single_product_prompt,
    build_fallback_note
)

logger = logging.getLogger(__name__)


def initialize_gemini() -> Optional[genai.Client]:
    """
    Initialize the Gemini client with the API key.
    Called once when the service is first used.
    """
    if not settings.GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY is not set. Gemini calls will fail.")
        return None

    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        logger.info(f"Gemini client initialized for model: {settings.GEMINI_MODEL}")
        return client
    except Exception as e:
        logger.error(f"Failed to initialize Gemini: {e}")
        return None


def _call_gemini(client: genai.Client, prompt: str) -> str:
    response = client.models.generate_content(
        model=settings.GEMINI_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_INSTRUCTION,
            max_output_tokens=8192,
        ),
    )
    finish_reason = response.candidates[0].finish_reason if response.candidates else None
    if finish_reason and str(finish_reason) != "FinishReason.STOP":
        logger.warning(f"Gemini generation ended with finish_reason={finish_reason} (not STOP — response may be truncated)")
    return response.text


def extract_json_from_response(text: str) -> Optional[dict]:
    """Unchanged — still needed since the model may still wrap JSON in markdown."""
    if not text:
        return None
    try:
        return json.loads(text.strip())
    except json.JSONDecodeError:
        pass

    clean_text = re.sub(r'```(?:json)?\s*', '', text)
    clean_text = re.sub(r'```\s*$', '', clean_text).strip()
    try:
        return json.loads(clean_text)
    except json.JSONDecodeError:
        pass

    json_match = re.search(r'\{[\s\S]*\}', text)
    if json_match:
        try:
            return json.loads(json_match.group())
        except json.JSONDecodeError:
            pass

    logger.warning(f"Could not parse JSON from Gemini response: {text[:200]}...")
    return None


def generate_style_notes_batch(user_query: str, products: List[Product]) -> Dict[int, str]:
    """
    Generate style notes for ALL products in a single Gemini API call.
    This is the preferred method — efficient and fast.

    Returns a dictionary mapping product_id → style_note string.
    Example: {102: "This hoodie matches...", 205: "This jacket suits..."}
    """
    client = initialize_gemini()

    if not client:
        logger.warning("Gemini not available. Returning fallback notes.")
        return {p.id: build_fallback_note(user_query, p) for p in products}

    prompt = build_batch_prompt(user_query, products)

    try:
        logger.info(f"Sending batch prompt to Gemini for {len(products)} products...")
        response_text = _call_gemini(client, prompt)
        parsed = extract_json_from_response(response_text)

        if not parsed or "products" not in parsed:
            logger.warning("Gemini response missing 'products' key. Falling back.")
            return _generate_individual_notes(user_query, products, client)

        result = {}
        for item in parsed["products"]:
            try:
                product_id = int(item.get("id", 0))
                style_note = str(item.get("style_note", "")).strip()
                if product_id and style_note:
                    result[product_id] = style_note
            except (ValueError, TypeError) as e:
                logger.warning(f"Could not parse product item from Gemini: {item} — {e}")

        missing_ids = [p.id for p in products if p.id not in result]
        if missing_ids:
            logger.warning(f"Missing style notes for product IDs: {missing_ids}")
            for p in products:
                if p.id not in result:
                    result[p.id] = build_fallback_note(user_query, p)

        logger.info(f"Generated {len(result)} style notes successfully.")
        return result

    except Exception as e:
        logger.error(f"Gemini batch call failed: {e}")
        return _generate_individual_notes(user_query, products, client)


def _generate_individual_notes(user_query: str, products: List[Product], client: genai.Client) -> Dict[int, str]:
    """
    Fallback: Generate style notes one product at a time.
    Used when the batch call fails or returns incomplete data.
    Slower but more reliable.
    """
    logger.info("Falling back to individual product style note generation...")
    result = {}
    for product in products:
        try:
            prompt = build_single_product_prompt(user_query, product)
            response_text = _call_gemini(client, prompt)
            parsed = extract_json_from_response(response_text)
            if parsed and "style_note" in parsed:
                result[product.id] = str(parsed["style_note"]).strip()
            else:
                result[product.id] = build_fallback_note(user_query, product)
        except Exception as e:
            logger.error(f"Individual Gemini call failed for product {product.id}: {e}")
            result[product.id] = build_fallback_note(user_query, product)
    return result


def is_gemini_configured() -> bool:
    return bool(settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.strip())