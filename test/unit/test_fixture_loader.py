# test/unit/test_fixture_loader.py
"""Unit tests for services.matching.fixture_loader."""
from __future__ import annotations

from pathlib import Path

import pytest

from services.matching.fixture_loader import (
    Fixture,
    FixtureCourse,
    load_all_fixtures,
    load_fixture,
)


FIXTURES_DIR = Path("test/fixtures")


def test_load_fixture_001():
    fx = load_fixture(FIXTURES_DIR / "fixture_001")
    assert isinstance(fx, Fixture)
    assert fx.fixture_id == "fixture_001"
    assert fx.source.code == "CS-341"
    assert fx.target.code == "CS-501"
    assert fx.source.credits == 4.0


def test_outcomes_are_enriched_with_bloom_and_domain():
    fx = load_fixture(FIXTURES_DIR / "fixture_001")
    assert len(fx.source.outcomes) == 5
    first = fx.source.outcomes[0]
    assert set(first.keys()) == {"text", "bloom_level", "domain"}
    assert isinstance(first["text"], str)
    assert isinstance(first["bloom_level"], int)
    assert isinstance(first["domain"], str)


def test_bloom_level_parsed_correctly():
    fx = load_fixture(FIXTURES_DIR / "fixture_001")
    blooms = {o["text"]: o["bloom_level"] for o in fx.source.outcomes}
    # "Explain the relational model..." -> understand (2)
    for text, lvl in blooms.items():
        if text.startswith("Explain"):
            assert lvl == 2
        if text.startswith("Design"):
            assert lvl == 6
        if text.startswith("Analyze"):
            assert lvl == 4


def test_domain_classified_as_cs():
    fx = load_fixture(FIXTURES_DIR / "fixture_001")
    for o in fx.source.outcomes:
        assert o["domain"] == "computer_science"


def test_expected_dict_preserved():
    fx = load_fixture(FIXTURES_DIR / "fixture_001")
    assert fx.expected["status"] == "DIRECT"
    assert fx.expected["outcome_coverage_min"] == 0.90


def test_modality_default_and_override():
    fx1 = load_fixture(FIXTURES_DIR / "fixture_001")
    assert fx1.source.modality == "theory"  # no modality in fixture_001 -> default

    fx3 = load_fixture(FIXTURES_DIR / "fixture_003")
    assert fx3.source.modality == "theory"
    assert fx3.target.modality == "theory+lab"


def test_load_all_fixtures_returns_at_least_three():
    fixtures = load_all_fixtures(FIXTURES_DIR)
    assert len(fixtures) >= 3
    ids = {f.fixture_id for f in fixtures}
    assert {"fixture_001", "fixture_002", "fixture_003"}.issubset(ids)


def test_missing_gold_json_raises(tmp_path):
    empty = tmp_path / "fixture_empty"
    empty.mkdir()
    with pytest.raises(FileNotFoundError):
        load_fixture(empty)


def test_malformed_gold_json_raises(tmp_path):
    bad = tmp_path / "fixture_bad"
    bad.mkdir()
    (bad / "gold.json").write_text('{"fixture_id": "x"}', encoding="utf-8")
    with pytest.raises(ValueError):
        load_fixture(bad)
