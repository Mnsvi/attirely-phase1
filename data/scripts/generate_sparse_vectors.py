"""
Generates BM25-style sparse term-frequency vectors from search_text.

The vectors are intended for the Qdrant collection's `sparse` named vector,
which is configured with Modifier.IDF. FastEmbed produces the sparse
term-frequency representation; Qdrant applies the corpus-level IDF component.

CPU-only.
"""

import json
from pathlib import Path

import pandas as pd
from fastembed import SparseTextEmbedding


PRODUCTS_PATH = Path("data-prep/processed/products.parquet")
OUTPUT_PATH = Path("data-prep/processed/sparse_vectors.json")

MODEL_NAME = "Qdrant/bm25"


def generate_sparse_vectors(
    df: pd.DataFrame,
    text_column: str = "search_text",
) -> dict[int, dict]:

    model = SparseTextEmbedding(
        model_name=MODEL_NAME
    )

    texts = df[text_column].tolist()
    ids = df["id"].tolist()

    sparse_vectors = {}

    for pid, embedding in zip(
        ids,
        model.embed(texts)
    ):
        sparse_vectors[int(pid)] = {
            "indices": embedding.indices.tolist(),
            "values": embedding.values.tolist(),
        }

    return sparse_vectors


def main():

    df = pd.read_parquet(PRODUCTS_PATH)

    assert len(df) == 44_419
    assert df["id"].is_unique
    assert df["search_text"].notna().all()

    sparse_vectors = generate_sparse_vectors(df)

    assert len(sparse_vectors) == 44_419
    assert set(sparse_vectors.keys()) == set(
        df["id"].astype(int)
    )

    OUTPUT_PATH.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    with open(OUTPUT_PATH, "w") as f:
        json.dump(
            sparse_vectors,
            f
        )

    print(
        f"Generated sparse vectors for "
        f"{len(sparse_vectors)} products"
    )

    print(
        f"Saved to: {OUTPUT_PATH}"
    )


if __name__ == "__main__":
    main()