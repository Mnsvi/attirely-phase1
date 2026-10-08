"""
Reusable loader: upserts cleaned product rows + embeddings into Qdrant.
Callable by anyone once they have dense/sparse vectors — doesn't require
understanding the cleaning pipeline itself.
"""

import os
import pandas as pd
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct, SparseVector

from create_collection import COLLECTION_NAME, get_client

PAYLOAD_FIELDS = [
    "product_display_name", "brand_name", "gender", "master_category",
    "sub_category", "article_type", "base_colour", "season", "usage",
    "year", "price", "discounted_price", "image_url", "description",
    "pattern", "fabric", "sleeve_length", "occasion", "fit", "neck", "length",
]


def build_point(row: dict, dense_vector: list[float], sparse_vector: dict) -> PointStruct:
    """
    dense_vector: list[float], length == DENSE_DIM
    sparse_vector: {"indices": [...], "values": [...]} — standard sparse format
    """
    payload = {field: row.get(field) for field in PAYLOAD_FIELDS}

    return PointStruct(
        id=int(row["id"]),
        vector={
            "dense": dense_vector,
            "sparse": SparseVector(
                indices=sparse_vector["indices"],
                values=sparse_vector["values"],
            ),
        },
        payload=payload,
    )


def upsert_products(
    client: QdrantClient,
    df: pd.DataFrame,
    dense_vectors: dict[int, list[float]],
    sparse_vectors: dict[int, dict],
    batch_size: int = 256,
) -> None:
    """
    dense_vectors / sparse_vectors: {product_id: vector}, keyed by the
    same `id` column as df.
    """
    points = []
    for _, row in df.iterrows():
        pid = int(row["id"])
        if pid not in dense_vectors or pid not in sparse_vectors:
            continue  # embedding owner should report skipped IDs
        points.append(build_point(row.to_dict(), dense_vectors[pid], sparse_vectors[pid]))

    for i in range(0, len(points), batch_size):
        batch = points[i:i + batch_size]
        client.upsert(collection_name=COLLECTION_NAME, points=batch)
        print(f"Upserted {i + len(batch)}/{len(points)}")


if __name__ == "__main__":
    # Smoke test with dummy vectors — validates the schema end-to-end
    # before real embeddings exist.
    client = get_client()
    df = pd.read_parquet("data-prep/processed/products.parquet").head(5)

    dummy_dense = {int(r["id"]): [0.0] * 512 for _, r in df.iterrows()}
    dummy_sparse = {int(r["id"]): {"indices": [0, 1], "values": [1.0, 0.5]} for _, r in df.iterrows()}

    upsert_products(client, df, dummy_dense, dummy_sparse)
    print("Smoke test upsert complete — check the Qdrant dashboard.")