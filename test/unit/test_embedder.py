# test/unit/test_embedder.py
"""Unit tests for services.matching.embedder.

NOTE: The first test run will download the all-MiniLM-L6-v2 model (~80 MB)
from HuggingFace. Subsequent runs are instant.
"""
from __future__ import annotations

import math

import pytest

from services.matching.embedder import (
    EMBEDDING_DIM,
    embed,
    embed_batch,
    embedding_dim,
)


def _l2_norm(v: list[float]) -> float:
    return math.sqrt(sum(x * x for x in v))


def test_embedding_dim_constant():
    assert embedding_dim() == 384
    assert EMBEDDING_DIM == 384


def test_embed_returns_384_dim_unit_vector():
    v = embed("Database management systems cover relational algebra.")
    assert isinstance(v, list)
    assert len(v) == 384
    assert all(isinstance(x, float) for x in v)
    # normalized -> L2 norm ~ 1
    assert abs(_l2_norm(v) - 1.0) < 1e-4


def test_embed_rejects_empty_string():
    with pytest.raises(ValueError):
        embed("")
    with pytest.raises(ValueError):
        embed("   ")


def test_embed_batch_matches_single():
    texts = [
        "Introduction to algorithms and data structures.",
        "Advanced database systems and query optimization.",
    ]
    batch = embed_batch(texts)
    assert len(batch) == 2
    for v in batch:
        assert len(v) == 384
        assert abs(_l2_norm(v) - 1.0) < 1e-4

    single = embed(texts[0])
    # batch and single should be numerically ~identical
    for a, b in zip(batch[0], single):
        assert abs(a - b) < 1e-4


def test_embed_batch_empty_returns_empty():
    assert embed_batch([]) == []


def test_embed_batch_rejects_empty_element():
    with pytest.raises(ValueError):
        embed_batch(["ok text", ""])


def test_similar_texts_have_higher_cosine_than_dissimilar():
    a = embed("Database management systems: SQL, transactions, indexes.")
    b = embed("Relational database systems: SQL queries and transactions.")
    c = embed("Nineteenth-century French impressionist painting.")

    def dot(x, y):
        return sum(i * j for i, j in zip(x, y))

    sim_ab = dot(a, b)
    sim_ac = dot(a, c)
    assert sim_ab > sim_ac, f"expected {sim_ab} > {sim_ac}"
