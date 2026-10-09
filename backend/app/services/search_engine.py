```python
import sys
from functools import lru_cache
from typing import List, Dict, Any, Optional

import torch
import open_clip
from PIL import Image
from qdrant_client import QdrantClient
from qdrant_client.http import models
from sentence_transformers import CrossEncoder


class SearchEngine:

    def __init__(self, qurl: str, api: Optional[str] = None):

        # -------------------------------------------------
        # QDRANT CONNECTION
        # -------------------------------------------------

        try:
            self.client = QdrantClient(
                url=qurl,
                api_key=api,
                timeout=30
            )
            collections_response = self.client.get_collections()

            if collections_response.collections:
                self.collection_name = (
                    collections_response.collections[0].name
                )
                print(
                    f"Connected to Qdrant. Automatically using "
                    f"active collection: '{self.collection_name}'",
                    flush=True
                )
            else:
                raise RuntimeError(
                    "No collections found in Qdrant."
                )

        except Exception as e:
            raise RuntimeError(
                f"Qdrant initialization failed: {e}"
            ) from e

        # -------------------------------------------------
        # FASHION-CLIP INITIALIZATION
        # -------------------------------------------------

        self.M = "hf-hub:Marqo/marqo-fashionCLIP"

        print(
            "Starting Fashion-CLIP model loading...",
            flush=True
        )

        try:
            self.model, _, self.preprocess = (
                open_clip.create_model_and_transforms(
                    self.M
                )
            )

            print(
                "Fashion-CLIP model loaded.",
                flush=True
            )

            self.tokenizer = open_clip.get_tokenizer(
                self.M
            )

            self.model.eval()

            # Run inference on CPU unless explicitly changed.
            self.device = torch.device("cpu")
            self.model = self.model.to(self.device)

            print(
                "Fashion-CLIP model and tokenizer initialized.",
                flush=True
            )

        except Exception as e:
            raise RuntimeError(
                f"Fashion-CLIP initialization failed: {e}"
            ) from e

        # -------------------------------------------------
        # CROSS-ENCODER INITIALIZATION
        # -------------------------------------------------

        print(
            "Starting cross-encoder loading...",
            flush=True
        )

        try:
            self.cross_encoder_model = CrossEncoder(
                "cross-encoder/ms-marco-MiniLM-L-6-v2",
                device="cpu"
            )

            print(
                "Cross-encoder loaded successfully.",
                flush=True
            )

        except Exception as e:
            raise RuntimeError(
                f"Cross-encoder initialization failed: {e}"
            ) from e

    # ---------------------------------------------------------
    # QUERY EMBEDDING
    # ---------------------------------------------------------

    def generate_query_embedding(
        self,
        text: Optional[str] = None,
        image: Optional[Image.Image] = None
    ) -> List[float]:

        feature_t = None
        feature_i = None

        with torch.no_grad():

            if text:
                tokens = self.tokenizer([text]).to(self.device)

                feature_t = self.model.encode_text(tokens)
                feature_t /= feature_t.norm(
                    dim=-1,
                    keepdim=True
                )

            if image is not None:
                tensor = self.preprocess(image).unsqueeze(0)
                tensor = tensor.to(self.device)

                feature_i = self.model.encode_image(tensor)
                feature_i /= feature_i.norm(
                    dim=-1,
                    keepdim=True
                )

            if feature_t is not None and feature_i is not None:
                blend = feature_t + feature_i
                blend /= blend.norm(dim=-1, keepdim=True)
                return blend.squeeze(0).cpu().tolist()

            if feature_t is not None:
                return feature_t.squeeze(0).cpu().tolist()

            if feature_i is not None:
                return feature_i.squeeze(0).cpu().tolist()

            raise ValueError(
                "Provide at least a text query or an image query."
            )

    # ---------------------------------------------------------
    # QDRANT FILTERS
    # ---------------------------------------------------------

    def _build_qdrant_filters(
        self,
        dic: Optional[Dict[str, Any]] = None
    ) -> Optional[models.Filter]:

        if not dic:
            return None

        must_clauses = []

        fields = [
            "brand_name",
            "gender",
            "master_category",
            "sub_category",
            "article_type",
            "base_colour",
            "season",
            "usage",
            "year",
            "pattern",
            "fabric",
            "sleeve_length",
            "occasion",
            "fit",
            "neck",
            "length"
        ]

        for field in fields:
            if field in dic and dic[field] is not None:
                val = dic[field]

                if isinstance(val, list):
                    must_clauses.append(
                        models.FieldCondition(
                            key=field,
                            match=models.MatchAny(any=val)
                        )
                    )
                else:
                    must_clauses.append(
                        models.FieldCondition(
                            key=field,
                            match=models.MatchValue(value=val)
                        )
                    )

        if dic.get("min_price") is not None:
            must_clauses.append(
                models.FieldCondition(
                    key="discounted_price",
                    range=models.Range(
                        gte=float(dic["min_price"])
                    )
                )
            )

        if dic.get("max_price") is not None:
            must_clauses.append(
                models.FieldCondition(
                    key="discounted_price",
                    range=models.Range(
                        lte=float(dic["max_price"])
                    )
                )
            )

        return (
            models.Filter(must=must_clauses)
            if must_clauses
            else None
        )

    # ---------------------------------------------------------
    # HYBRID SEARCH
    # ---------------------------------------------------------

    def hybrid_search(
        self,
        dense_vector: List[float],
        text_query: Optional[str] = None,
        hard_filters: Optional[models.Filter] = None,
        limit_can: int = 50
    ) -> List[Any]:

        hnsw = models.Prefetch(
            query=dense_vector,
            using="dense",
            filter=hard_filters,
            limit=limit_can
        )

        prefetch = [hnsw]

        if text_query:
            bm25 = models.Prefetch(
                query=models.Document(
                    text=text_query,
                    model="Qdrant/bm25"
                ),
                using="sparse",
                filter=hard_filters,
                limit=limit_can
            )
            prefetch.append(bm25)

        response = self.client.query_points(
            collection_name=self.collection_name,
            prefetch=prefetch,
            query=models.FusionQuery(
                fusion=models.Fusion.RRF
            ),
            query_filter=hard_filters,
            limit=limit_can,
            with_payload=True
        )

        return response.points

    # ---------------------------------------------------------
    # RETRIEVAL
    # ---------------------------------------------------------

    def execute_retrieval(
        self,
        dense_vector: List[float],
        text_query: Optional[str] = None,
        filter_dict: Optional[Dict[str, Any]] = None,
        limit_candidates: int = 50
    ) -> List[Any]:

        hard_filters = self._build_qdrant_filters(filter_dict)

        if text_query:
            return self.hybrid_search(
                dense_vector=dense_vector,
                text_query=text_query,
                hard_filters=hard_filters,
                limit_can=limit_candidates
            )

        response = self.client.query_points(
            collection_name=self.collection_name,
            query=dense_vector,
            using="dense",
            query_filter=hard_filters,
            limit=limit_candidates,
            with_payload=True
        )

        return response.points

    # ---------------------------------------------------------
    # FASHION-AWARE RERANKING
    # ---------------------------------------------------------

    def precision_rerank(
        self,
        query_text: Optional[str] = None,
        items_found: Optional[List[Any]] = None
    ) -> List[Any]:

        if not query_text or not items_found:
            return items_found or []

        query = query_text.lower().strip()

        category_terms = {
            "coat": ["coat", "overcoat"],
            "jacket": ["jacket"],
            "shirt": ["shirt"],
            "t-shirt": ["t-shirt", "tshirt"],
            "dress": ["dress"],
            "trousers": ["trouser", "trousers"],
            "pants": ["pant", "pants"],
            "jeans": ["jean", "jeans"],
            "skirt": ["skirt"],
            "shorts": ["short", "shorts"],
            "sweater": ["sweater", "pullover"],
            "sweatshirt": ["sweatshirt"],
            "hoodie": ["hoodie"],
            "shawl": ["shawl"],
            "scarf": ["scarf"],
            "saree": ["saree", "sari"],
            "kurta": ["kurta"],
            "leggings": ["legging", "leggings"],
            "cardigan": ["cardigan"],
            "top": ["top"],
            "blazer": ["blazer"]
        }

        material_terms = {
            "wool": ["wool", "woolen", "woollen"],
            "cotton": ["cotton"],
            "silk": ["silk"],
            "linen": ["linen"],
            "denim": ["denim"],
            "leather": ["leather"],
            "polyester": ["polyester"],
            "nylon": ["nylon"],
            "acrylic": ["acrylic"]
        }

        requested_category = next(
            (
                category
                for category, terms in category_terms.items()
                if any(term in query for term in terms)
            ),
            None
        )

        requested_material = next(
            (
                material
                for material, terms in material_terms.items()
                if any(term in query for term in terms)
            ),
            None
        )

        scored_items = []

        for item in items_found:
            payload = item.payload or {}

            title = str(
                payload.get("product_display_name", "")
            ).lower()

            article_type = str(
                payload.get("article_type", "")
            ).lower()

            fabric = str(
                payload.get("fabric", "")
            ).lower()

            description = str(
                payload.get("description", "")
            ).lower()

            score = float(getattr(item, "score", 0.0) or 0.0)

            category_match = False
            material_match = False

            if requested_category:
                terms = category_terms[requested_category]
                category_match = any(
                    term in article_type or term in title
                    for term in terms
                )
                score += 100 if category_match else -100

            if requested_material:
                terms = material_terms[requested_material]
                material_match = any(
                    term in fabric
                    or term in title
                    or term in description
                    for term in terms
                )
                score += 50 if material_match else -30

            if (
                requested_category
                and requested_material
                and category_match
                and material_match
            ):
                score += 100

            scored_items.append((item, score))

        scored_items.sort(
            key=lambda x: x[1],
            reverse=True
        )

        return [item for item, _ in scored_items]

    # ---------------------------------------------------------
    # MAIN SEARCH
    # ---------------------------------------------------------

    def discover_fashion(
        self,
        text_query: Optional[str] = None,
        image_query: Optional[Image.Image] = None,
        filters: Optional[Dict[str, Any]] = None,
        apply_rerank: bool = False,
        top_k: int = 10
    ) -> List[Dict[str, Any]]:

        dense_vector = self.generate_query_embedding(
            text=text_query,
            image=image_query
        )

        limit_candidates = 100 if apply_rerank else top_k

        points = self.execute_retrieval(
            dense_vector=dense_vector,
            text_query=text_query,
            filter_dict=filters,
            limit_candidates=limit_candidates
        )

        if apply_rerank and text_query and points:
            ordered_points = self.precision_rerank(
                query_text=text_query,
                items_found=points
            )
        else:
            ordered_points = points

        return [
            {
                "id": int(p.id),
                "payload": p.payload or {},
                "score": getattr(p, "score", None)
            }
            for p in ordered_points[:top_k]
        ]
```
