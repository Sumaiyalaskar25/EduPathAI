# test/unit/test_cross_encoder.py
"""Unit tests for services.matching.cross_encoder.

NOTE: First run downloads cross-encoder/ms-marco-MiniLM-L-6-v2 (~90 MB).
Subsequent runs are fast.
"""
from __future__ import annotations

import pytest

from services.matching.cross_encoder import (
    MODEL_NAME,
    rerank,
    score_pair,
)


def test_model_name_constant():
    assert "ms-marco-MiniLM" in MODEL_NAME


def test_score_pair_in_range():
    score = score_pair(
        "database normalization and transactions",
        "relational database systems with SQL",
    )
    assert 0.0 <= score <= 1.0


def test_rerank_returns_one_score_per_candidate():
    query = "machine learning algorithms"
    candidates = [
        "supervised learning and neural networks",
        "organizational behaviour in corporations",
        "statistical learning theory and regression",
    ]
    scores = rerank(query, candidates)
    assert len(scores) == 3
    assert all(0.0 <= s <= 1.0 for s in scores)


def test_rerank_relevant_scores_higher_than_irrelevant():
    query = "introduction to database systems and SQL"
    candidates = [
        "relational databases, SQL queries, transactions, normalization",
        "renaissance painting techniques and fresco restoration",
    ]
    scores = rerank(query, candidates)
    assert scores[0] > scores[1], f"expected {scores[0]} > {scores[1]}"


def test_rerank_empty_returns_empty():
    assert rerank("query", []) == []


def test_rerank_rejects_empty_query():
    with pytest.raises(ValueError):
        rerank("", ["something"])


def test_rerank_rejects_empty_candidate():
    with pytest.raises(ValueError):
        rerank("query", ["ok", ""])
