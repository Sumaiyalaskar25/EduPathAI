# test/unit/test_domain_shard.py
"""Unit tests for services.matching.domain_shard."""
from __future__ import annotations

from services.matching.domain_shard import (
    Domain,
    classify_domain,
    is_same_domain,
)


def test_cs_domain_by_name():
    assert classify_domain("Data Structures and Algorithms") == Domain.CS
    assert classify_domain("Database Management Systems") == Domain.CS
    assert classify_domain("Operating Systems") == Domain.CS


def test_math_domain_by_name():
    assert classify_domain("Linear Algebra") == Domain.MATH
    assert classify_domain("Probability and Statistics") == Domain.MATH


def test_physics_domain_by_name():
    assert classify_domain("Quantum Mechanics") == Domain.PHYSICS


def test_domain_from_outcome_texts():
    d = classify_domain(
        "Course 101",
        outcome_texts=["Design relational databases and write SQL queries"],
    )
    assert d == Domain.CS


def test_unknown_returns_other():
    assert classify_domain("Introduction to Pottery") == Domain.OTHER
    assert classify_domain("") == Domain.OTHER


def test_is_same_domain():
    assert is_same_domain(Domain.CS, Domain.CS) is True
    assert is_same_domain(Domain.CS, Domain.MATH) is False
    assert is_same_domain(Domain.OTHER, Domain.OTHER) is True


def test_engineered_domain_keywords():
    assert classify_domain("Mechanical Engineering: Thermodynamics") == Domain.PHYSICS \
        or classify_domain("Mechanical Engineering: Thermodynamics") == Domain.ENGINEERING
