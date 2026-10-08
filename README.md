<img width="1341" height="511" alt="image" src="https://github.com/user-attachments/assets/d1fff372-e5df-499c-a8bc-b6892f6307ba" />


Attirely is a multimodal fashion search with AI-generated style notes where user can upload an image or describe what they want and it will retrieve visually and semantically similar products, each with a personalized explanation of why it matches.

## Key Features

- **Dual-input search** — query by uploading a photo, typing a description, or both.
- **Parallel dense + sparse retrieval** — semantic/visual similarity (dense) and exact keyword matching (sparse) run side by side so neither vague queries nor specific terms get lost.
- **Grounded AI explanations** — style notes are generated only from verified product attributes, not invented by the LLM.
- **Filterable results** — price, size, and category constraints applied as hard rules, never overridden by similarity.
- **Precision re-ranking** — a cross-encoder step available for cases where broad retrieval alone isn't precise enough.

## Architecture

```
User Input (image and/or text)
            ↓
   FashionCLIP Embedding
   (shared vector space)
            ↓
   ┌────────────────────┐
   │  Dense (Qdrant ANN) │
   │         +           │
   │  Sparse (BM25)      │
   └────────────────────┘
            ↓
      Apply Filters
   (price, size, category)
            ↓
   Re-rank (optional)
   (cross-encoder)
            ↓
      Final Top 10
            ↓
   Attach Metadata
  (color, material, fit)
            ↓
   LLM Style Note Generation
   (one batched call, grounded)
            ↓
   Results + Style Notes → User
```

**Design principle:** every stage only ever passes a `product_id` forward. Full product records (image, price, metadata) are looked up once, right before they're needed.


## Intelligence System

| Component | Role | Why it works this way |
| --- | --- | --- |
| **MarcoCLIP** (image + text encoder) | Converts both catalog items and queries into one shared embedding space | CLIP fine-tuned specifically on fashion image-text pairs — captures fashion-specific attributes (fit, fabric, silhouette) more precisely than generic CLIP |
| **Qdrant (dense search)** | Fast approximate nearest-neighbor search over FashionCLIP vectors | Purpose-built vector database with HNSW indexing — captures semantic/visual similarity even with zero word overlap between query and product |
| **BM25 (sparse search)** | Keyword search over an inverted index | Catches exact terms (fabric, size) that dense similarity can blur |
| **Cross-encoder (re-ranking)** | Scores query + product together, not separately | Catches nuance bi-encoders miss (e.g., a word describing a minor detail vs. the main feature) — used only on a small shortlist since it can't be precomputed |
| **LLM (style notes)** | Generates a short explanation per product | Constrained to only use structured, verified product attributes — prevents hallucinated details |

## Tech Stack

| Layer | Choice |
| --- | --- |
| Embeddings | MarcoCLIP |
| Dense search | Qdrant (HNSW index) |
| Sparse search | Qdrant's built-in sparse vector support |
| Re-ranking | Cross-encoder (sentence-transformers) |
| Style note generation | LLM API (Gemini) |
| Database | Qdrant (vectors) |
| Backend | FastAPI |
| Frontend | React |

## Development Plan

Built in four sequential, independently testable parts:

| Part | Focus | Deliverable |
| --- | --- | --- |
| **1. Data & Database** | Clean and subset the dataset, verify images, finalize schema, set up Postgres (metadata) + Qdrant (vectors) | Cleaned catalog + working database/vector store with indexes ready |
| **2. Embedding & Retrieval** | Generate FashionCLIP embeddings, implement dense (Qdrant) + sparse (BM25) search | A function that returns ranked candidates for any query |
| **3. Refinement** | Apply filters, evaluate and (if needed) implement re-ranking | Precise final top-10 selection |
| **4. Generation & Delivery** | Attach metadata, batch the LLM call, wire up the frontend | End-to-end working app: query in, ranked results with style notes out |

#### Links

Frontend template : https://attirely.my.canva.site/
