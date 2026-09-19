# services/matching/embedder.py
"""
Sentence-transformer embedder.

Produces 384-dim normalized vectors using all-MiniLM-L6-v2.
Model is cached process-wide (loading takes ~2-3s, then instant).

Output is plain Python lists - JSON-safe and pgvector-compatible.

Owner: Member 2
"""
from __future__ import annotations

from functools import lru_cache

from sentence_transformers import SentenceTransformer


MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
EMBEDDING_DIM = 384


@lru_cache(maxsize=1)
def _model() -> SentenceTransformer:
    """Load model once, cache for the process lifetime."""
    return SentenceTransformer(MODEL_NAME)


def embed(text: str) -> list[float]:
    """
    Embed a single string. Returns a unit-normalized 384-dim float list.

    Raises:
        ValueError: if text is empty.
    """
    if not isinstance(text, str) or not text.strip():
        raise ValueError("text must be a non-empty string")

    vector = _model().encode(text, normalize_embeddings=True)
    return vector.tolist()


def embed_batch(texts: list[str]) -> list[list[float]]:
    """
    Embed a batch of strings. Returns list of 384-dim float lists.
    Order is preserved.

    Raises:
        ValueError: if any text is empty.
    """
    if not texts:
        return []

    for i, t in enumerate(texts):
        if not isinstance(t, str) or not t.strip():
            raise ValueError(f"texts[{i}] must be a non-empty string")

    vectors = _model().encode(
        texts,
        normalize_embeddings=True,
        batch_size=32,
        show_progress_bar=False,
    )
    return [v.tolist() for v in vectors]


def embedding_dim() -> int:
    """Return the embedding dimension (384 for all-MiniLM-L6-v2)."""
    return EMBEDDING_DIM
