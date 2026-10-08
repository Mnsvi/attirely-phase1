"""
Utilities for cleaning and canonicalizing the fashion dataset.
"""

from pathlib import Path
import json
import re

import pandas as pd
import ftfy
from bs4 import BeautifulSoup


# ------------------
# Config
# ------------------

MISSING_ATTRIBUTE_VALUES = {
    "",
    "NA",
    "N/A",
    "NULL",
    "NONE",
    "NOT APPLICABLE",
    "NOT_AVAILABLE",
}

OPTIONAL_ATTRIBUTES = {
    "pattern": "Pattern",
    "fabric": "Fabric",
    "sleeve_length": "Sleeve Length",
    "occasion": "Occasion",
    "fit": "Fit",
    "neck": "Neck",
    "length": "Length",
}

DESCRIPTION_MAX_CHARS = 1500

KNOWN_MISSING_IMAGE_IDS = {12347, 39425, 39410, 39403, 39401}

# ------------------
# 1. Load
# ------------------

def load_styles_csv_ids(styles_csv_path: Path) -> set[int]:
    """Load valid product IDs from styles.csv."""
    
    df = pd.read_csv(
        styles_csv_path,
        on_bad_lines="skip"
    )
    
    return set(
        df["id"]
        .dropna()
        .astype(int)
    )


def load_json_records(styles_dir: Path) -> list[dict]:
    """Load all valid JSON files from the styles directory."""
    
    records = []
    
    for path in styles_dir.glob("*.json"):
        try:
            with open(path, "r", encoding="utf-8") as f:
                records.append(json.load(f))
        
        except json.JSONDecodeError:
            continue
    
    return records


# ------------------
# 2. Filter
# ------------------

def filter_valid_records(
    json_records: list[dict],
    valid_ids: set[int]
) -> list[dict]:
    """Keep only JSON records whose product ID exists in styles.csv."""
    
    return [
        record
        for record in json_records
        if record.get("data", {}).get("id") in valid_ids
    ]


# ------------------
# 3. Field helpers
# ------------------

def extract_type_name(value):
    """
    Extract typeName from Myntra's nested category objects.
    
    Example:
        {"id": 90, "typeName": "Tshirts"} -> "Tshirts"
    """
    
    if isinstance(value, dict):
        return value.get("typeName")
    
    return value


def is_missing_attribute(value) -> bool:
    """
    Return True if an article attribute represents a missing value.
    """
    
    if value is None:
        return True
    
    normalized = str(value).strip().upper()
    
    return normalized in MISSING_ATTRIBUTE_VALUES


def unwrap_descriptor(
    descriptors: dict,
    key: str
) -> str | None:
    """
    Extract the actual text value from a productDescriptors field.
    
    Myntra stores descriptor fields like:
        {
            "descriptorType": "description",
            "value": "<p>...</p>"
        }
    """
    
    if not isinstance(descriptors, dict):
        return None
    
    value = descriptors.get(key)
    
    if isinstance(value, dict):
        value = value.get("value")
    
    if isinstance(value, str) and value.strip():
        return value
    
    return None


def fix_encoding(text: str) -> str:
    """Fix common Unicode/encoding corruption using ftfy."""
    
    return ftfy.fix_text(text)


def strip_html(text: str) -> str:
    """
    Convert HTML to plain text and normalize whitespace.
    """
    
    plain = BeautifulSoup(
        text,
        "html.parser"
    ).get_text(separator=" ")
    
    return re.sub(
        r"\s+",
        " ",
        plain
    ).strip()


def truncate_text(
    text: str,
    max_chars: int = DESCRIPTION_MAX_CHARS
) -> str:
    """
    Truncate text at a word boundary if it exceeds max_chars.
    """
    
    if len(text) <= max_chars:
        return text
    
    cutoff = text.rfind(" ", 0, max_chars)
    
    if cutoff == -1:
        cutoff = max_chars
    
    return text[:cutoff].strip()

def clean_text(text: str | None) -> str | None:
    """
    Clean a general text field without truncating it.
    
    Order:
        encoding fix
        -> HTML stripping
        -> whitespace normalization
    """

    if text is None:
        return None

    if not isinstance(text, str):
        text = str(text)

    text = fix_encoding(text)
    text = strip_html(text)

    return text if text else None

def clean_description(
    raw: str | None
) -> str | None:
    """
    Clean a product description.
    
    Order:
        encoding fix
        -> HTML stripping
        -> whitespace normalization
        -> truncation
    """
    
    if raw is None:
        return None
    
    text = fix_encoding(raw)
    text = strip_html(text)
    text = truncate_text(text)
    
    return text if text else None

def parse_year(value):
    """Convert a valid year value to int, otherwise return None."""
    
    if value is None:
        return None
    
    try:
        return int(value)
    except (TypeError, ValueError):
        return None

def extract_image_url(style_images: dict) -> str | None:
    """Extract the preferred product image URL from styleImages."""

    if not isinstance(style_images, dict):
        return None

    preferred_keys = ["default", "front", "left", "top"]

    for key in preferred_keys:
        image_data = style_images.get(key)

        if isinstance(image_data, dict):
            image_url = image_data.get("imageURL")

            if isinstance(image_url, str) and image_url.strip():
                return image_url

    return None

# ------------------
# 4. Row builder
# ------------------

def build_row(record: dict) -> dict:
    """
    Convert one raw JSON record into one canonical product row.
    """

    data = record.get("data", {})

    # Article attributes
    attrs = data.get("articleAttributes", {})
    if not isinstance(attrs, dict):
        attrs = {}

    # Product descriptors
    descriptors = data.get("productDescriptors", {})
    raw_description = unwrap_descriptor(
        descriptors,
        "description"
    )

    # Default product image
    image_url = extract_image_url(
        data.get("styleImages", {})
    )

    row = {
        "id": data.get("id"),
        "product_display_name": clean_text(
            data.get("productDisplayName")
        ),
        "brand_name": clean_text(
            data.get("brandName")
        ),
        "gender": extract_type_name(
            data.get("gender")
        ),
        "master_category": extract_type_name(
            data.get("masterCategory")
        ),
        "sub_category": extract_type_name(
            data.get("subCategory")
        ),
        "article_type": extract_type_name(
            data.get("articleType")
        ),
        "base_colour": clean_text(
            data.get("baseColour")
        ),
        "season": clean_text(
            data.get("season")
        ),
        "usage": clean_text(
            data.get("usage")
        ),
        "year": parse_year(data.get("year")),
        "price": data.get("price"),
        "discounted_price": data.get("discountedPrice"),
        "description": clean_description(
            raw_description
        ),
        "image_url": image_url,
    }

    # Selected article attributes
    for schema_field, json_key in OPTIONAL_ATTRIBUTES.items():

        value = attrs.get(json_key)

        if is_missing_attribute(value):
            row[schema_field] = None
        else:
            row[schema_field] = str(value).strip()

    return row

# ------------------
# 5. Search text
# ------------------

def build_search_text(row: dict) -> str:
    """
    Build the textual representation used for lexical retrieval.
    """

    parts = [
        row.get("product_display_name"),
        row.get("brand_name"),
        row.get("master_category"),
        row.get("sub_category"),
        row.get("article_type"),
        row.get("base_colour"),
        row.get("usage"),
    ]

    # Add promoted article attributes when populated
    for schema_field in OPTIONAL_ATTRIBUTES:
        parts.append(row.get(schema_field))

    # Add cleaned description
    parts.append(row.get("description"))

    # Remove None / empty values
    parts = [
        str(value).strip()
        for value in parts
        if value is not None and str(value).strip()
    ]

    return " ".join(parts)

# ------------------
# 6. Sanity checks
# ------------------

EXPECTED_ROW_COUNT = 44_419


def run_sanity_checks(df: pd.DataFrame) -> None:
    """Validate the canonical product dataframe before saving."""

    assert len(df) == EXPECTED_ROW_COUNT, (
        f"Expected {EXPECTED_ROW_COUNT} rows, got {len(df)}"
    )

    assert df["id"].notna().all(), (
        "Null product IDs found"
    )

    assert df["id"].is_unique, (
        "Duplicate product IDs found"
    )

    assert df["image_url"].notna().all(), (
        "Rows missing image_url"
    )

    assert df["image_url"].str.strip().ne("").all(), (
        "Empty image_url found"
    )

    assert df["search_text"].notna().all(), (
        "Rows missing search_text"
    )

    assert df["search_text"].str.strip().ne("").all(), (
        "Empty search_text found"
    )

    print("All sanity checks passed.")