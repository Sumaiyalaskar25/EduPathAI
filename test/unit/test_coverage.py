# test/unit/test_coverage.py
"""Unit tests for services.matching.coverage."""
from __future__ import annotations

import pytest

from services.matching.coverage import (
    DEFAULT_CROSS_ENCODER_THRESHOLD,
    compute_outcome_coverage,
)


def _lo(text: str, bloom: int = 0) -> dict:
    return {"text": text, "bloom_level": bloom}


def test_default_threshold_constant():
    assert 0.0 <= DEFAULT_CROSS_ENCODER_THRESHOLD <= 1.0


def test_empty_target_returns_full_coverage():
    coverage, missing = compute_outcome_coverage(
        source_outcomes=[_lo("anything")],
        target_outcomes=[],
    )
    assert coverage == 1.0
    assert missing == []


def test_empty_source_returns_zero_coverage():
    targets = [_lo("Relational algebra"), _lo("Normalization")]
    coverage, missing = compute_outcome_coverage(
        source_outcomes=[],
        target_outcomes=targets,
    )
    assert coverage == 0.0
    assert len(missing) == 2
    assert missing == [t["text"] for t in targets]


def test_identical_texts_full_coverage():
    texts = [
        _lo("Explain relational algebra", 2),
        _lo("Design normalized schemas up to BCNF", 6),
        _lo("Write SQL queries with joins", 3),
    ]
    coverage, missing = compute_outcome_coverage(
        source_outcomes=texts,
        target_outcomes=texts,
    )
    assert coverage == 1.0
    assert missing == []


def test_partial_coverage_returns_expected_fraction():
    source = [
        _lo("Implement arrays and linked lists", 3),
        _lo("Implement binary search trees", 3),
    ]
    target = [
        _lo("Implement arrays and linked lists", 3),
        _lo("Implement binary search trees", 3),
        _lo("Design dynamic programming algorithms", 6),
        _lo("Perform amortized analysis", 4),
    ]
    coverage, missing = compute_outcome_coverage(source, target)
    assert coverage == pytest.approx(0.5)
    assert len(missing) == 2
    assert any("dynamic programming" in m.lower() for m in missing)
    assert any("amortized" in m.lower() for m in missing)


def test_bloom_gap_blocks_match():
    # Text nearly identical, but source Bloom way below target Bloom.
    source = [_lo("Explain relational algebra", 2)]   # understand
    target = [_lo("Design a new relational algebra", 6)]  # create
    coverage, missing = compute_outcome_coverage(source, target)
    assert coverage == 0.0
    assert missing == ["Design a new relational algebra"]


def test_bloom_satisfied_when_source_higher():
    source = [_lo("Design normalized schemas in BCNF", 6)]
    target = [_lo("Explain normalized schemas", 2)]
    coverage, missing = compute_outcome_coverage(source, target)
    assert coverage == 1.0
    assert missing == []


def test_unknown_bloom_does_not_block():
    # bloom_level=0 means "unknown" -> skip Bloom check
    source = [_lo("Explain relational algebra", 0)]
    target = [_lo("Explain relational algebra", 6)]
    coverage, missing = compute_outcome_coverage(source, target)
    assert coverage == 1.0


def test_low_threshold_accepts_weaker_matches(monkeypatch):
    """
    Unit test of threshold logic. Monkeypatch rerank so the score is
    deterministic (0.5), then verify a threshold above that rejects and
    a threshold below that accepts.
    """
    import services.matching.coverage as cov

    def fake_rerank(query, candidates):
        return [0.5 for _ in candidates]

    monkeypatch.setattr(cov, "rerank", fake_rerank)

    source = [_lo("anything source", 2)]
    target = [_lo("anything target", 2)]

    _, missing_high = cov.compute_outcome_coverage(
        source, target, cross_encoder_threshold=0.95,
    )
    _, missing_low = cov.compute_outcome_coverage(
        source, target, cross_encoder_threshold=0.01,
    )
    assert len(missing_high) == 1
    assert len(missing_low) == 0


def test_invalid_threshold_rejected():
    with pytest.raises(ValueError):
        compute_outcome_coverage(
            source_outcomes=[_lo("x")],
            target_outcomes=[_lo("y")],
            cross_encoder_threshold=1.5,
        )
