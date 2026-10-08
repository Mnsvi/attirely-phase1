"""
Creates the Qdrant collection with the finalized schema.
Run once. Re-running is safe — it checks for an existing collection first.
"""

import os

from dotenv import load_dotenv
load_dotenv()

from qdrant_client import QdrantClient
from qdrant_client.models import (
    VectorParams,
    SparseVectorParams,
    Modifier,
    Distance,
    PayloadSchemaType,
)

COLLECTION_NAME = "products"

# 512 = Marqo-FashionCLIP (ViT-B-16)
DENSE_DIM = 512

# Payload fields that need an index for filtering.
FILTERABLE_FIELDS = {
    "master_category": PayloadSchemaType.KEYWORD,
    "sub_category": PayloadSchemaType.KEYWORD,
    "article_type": PayloadSchemaType.KEYWORD,
    "gender": PayloadSchemaType.KEYWORD,
    "base_colour": PayloadSchemaType.KEYWORD,
    "season": PayloadSchemaType.KEYWORD,
    "usage": PayloadSchemaType.KEYWORD,
    "brand_name": PayloadSchemaType.KEYWORD,
    "year": PayloadSchemaType.INTEGER,
    "price": PayloadSchemaType.FLOAT,
    "discounted_price": PayloadSchemaType.FLOAT,
}


def get_client() -> QdrantClient:
    url = os.environ["QDRANT_URL"]
    api_key = os.environ["QDRANT_API_KEY"]
    return QdrantClient(url=url, api_key=api_key)


def create_collection(client: QdrantClient) -> None:
    existing = [c.name for c in client.get_collections().collections]
    if COLLECTION_NAME in existing:
        print(f"Collection '{COLLECTION_NAME}' already exists — skipping creation.")
        return

    client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config={
            "dense": VectorParams(size=DENSE_DIM, distance=Distance.COSINE),
        },
        sparse_vectors_config={
            "sparse": SparseVectorParams(modifier=Modifier.IDF),
        },
    )
    print(f"Created collection '{COLLECTION_NAME}' (dense={DENSE_DIM}, sparse=IDF).")


def create_payload_indexes(client: QdrantClient) -> None:
    for field_name, schema_type in FILTERABLE_FIELDS.items():
        client.create_payload_index(
            collection_name=COLLECTION_NAME,
            field_name=field_name,
            field_schema=schema_type,
        )
        print(f"Indexed payload field: {field_name} ({schema_type})")


def main():
    client = get_client()
    create_collection(client)
    create_payload_indexes(client)

    info = client.get_collection(COLLECTION_NAME)
    print("\nCollection info:")
    print(info)


if __name__ == "__main__":
    main()