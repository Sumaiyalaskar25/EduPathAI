# services/matching/cross_encoder.py
"""
Cross-encoder reranker.

Given (query, candidate) pairs, returns a relevance score in [0, 1].
Unlike bi-encoders (embeddings), cross-encoders see both texts jointly,
which is 5-10x more accurate for reranking.

Model: cross-encoder/ms-marco-MiniLM-L-6-v2 (~90 MB).
Cached process-wide.

Owner: Member 2
"""
from __future__ import annotations

import math
from functools import lru_cache

from sentence_transformers import CrossEncoder


MODEL_NAME = "cross-encoder/ms-marco-MiniLM-L-6-v2"


@lru_cache(maxsize=1)
def _model() -> CrossEncoder:
    """Load cross-encoder once, cache for the process lifetime."""
    return CrossEncoder(MODEL_NAME)


def _sigmoid(x: float) -> float:
    """Numerically stable sigmoid."""
    if x >= 0:
        z = math.exp(-x)
        return 1.0 / (1.0 + z)
    z = math.exp(x)
    return z / (1.0 + z)


def score_pair(query: str, candidate: str) -> float:
    """
    Score a single (query, candidate) pair.

    Returns a relevance score in [0, 1].
    """
    _validate_pair(query, candidate)
    raw = _model().predict([(query, candidate)])[0]
    return _sigmoid(float(raw))


def rerank(query: str, candidates: list[str]) -> list[float]:
    """
    Score query against multiple candidates.

    Returns a list of relevance scores in [0, 1], in the same order
    as `candidates`. Empty candidates -> empty list.
    """
    if not candidates:
        return []
    _validate_query(query)
    for i, c in enumerate(candidates):
        if not isinstance(c, str) or not c.strip():
            raise ValueError(f"candidates[{i}] must be a non-empty string")

    pairs = [(query, c) for c in candidates]
    raw = _model().predict(pairs)
    return [_sigmoid(float(x)) for x in raw]


def _validate_query(q: str) -> None:
    if not isinstance(q, str) or not q.strip():
        raise ValueError("query must be a non-empty string")


def _validate_pair(q: str, c: str) -> None:
    _validate_query(q)
    if not isinstance(c, str) or not c.strip():
        raise ValueError("candidate must be a non-empty string")
