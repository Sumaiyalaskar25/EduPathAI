# test/unit/test_bloom.py
"""Unit tests for services.matching.bloom."""
from __future__ import annotations

import pytest

from services.matching.bloom import (
    BLOOM_LEVELS,
    bloom_gap,
    bloom_level_name,
    bloom_satisfies,
    parse_bloom,
)


def test_bloom_levels_are_1_through_6():
    assert set(BLOOM_LEVELS.keys()) == {1, 2, 3, 4, 5, 6}
    assert BLOOM_LEVELS[1] == "remember"
    assert BLOOM_LEVELS[6] == "create"


def test_bloom_satisfies():
    assert bloom_satisfies(4, 3) is True     # analyze >= apply
    assert bloom_satisfies(3, 3) is True     # apply >= apply
    assert bloom_satisfies(2, 4) is False    # understand < analyze


def test_bloom_satisfies_rejects_out_of_range():
    with pytest.raises(ValueError):
        bloom_satisfies(0, 3)
    with pytest.raises(ValueError):
        bloom_satisfies(3, 7)


def test_bloom_gap_full_partial_none():
    # source covers everything
    assert bloom_gap([6], [1, 2, 3, 4, 5, 6]) == 1.0
    # source covers 2 of 3
    gap = bloom_gap([1, 2, 3], [1, 2, 4])
    assert abs(gap - 2 / 3) < 1e-9
    # source covers none
    assert bloom_gap([1], [4, 5, 6]) == 0.0


def test_bloom_gap_empty_target_is_1():
    assert bloom_gap([1, 2], []) == 1.0


def test_parse_bloom_from_verb():
    assert parse_bloom("Explain the relational model") == 2
    assert parse_bloom("Design a normalized schema") == 6
    assert parse_bloom("Analyze query execution plans") == 4
    assert parse_bloom("List the ACID properties") == 1


def test_parse_bloom_unknown_returns_0():
    assert parse_bloom("xyzqwerty") == 0
    assert parse_bloom("") == 0


def test_bloom_level_name():
    assert bloom_level_name(3) == "apply"
    with pytest.raises(ValueError):
        bloom_level_name(7)
