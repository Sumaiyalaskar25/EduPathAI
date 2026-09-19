# test/integration/test_matcher_on_fixtures.py
"""
Killer integration test.

Runs the REAL RealMatcher + REAL recognizer against Member 1's fixtures.
Asserts that the pipeline classifies each fixture with the gold status,
produces the gold missing outcomes, and populates all 8 signals.

This is the test that proves Member 2's work actually replaces
StubMatcher without breaking Member 1's guarantees.
"""
from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

import pytest

from services.matching.fixture_loader import load_all_fixtures
from services.matching.real import RealMatcher
from services.matching.stub import StubMatcher
from services.recognition.recognizer import classify
from services.schemas import DecisionBundle, RecognitionStatus


FIXTURES_DIR = Path("test/fixtures")


def _make_bundle(threshold: float = 0.70) -> DecisionBundle:
    return DecisionBundle(
        id=uuid4(),
        curriculum_version="integration/v1",
        policy_version="integration/v1",
        model_version="integration",
        prompt_version="integration",
        embedding_model_version="sentence-transformers/all-MiniLM-L6-v2",
        cross_encoder_version="cross-encoder/ms-marco-MiniLM-L-6-v2",
        retrieval_threshold=threshold,
        solver_version="integration",
        solver_parameters_hash="hash",
        resource_catalog_version="integration",
        ontology_version="integration",
        ruleset_commit="abc",
        tool_definitions_hash="def",
        captured_at=datetime.now(timezone.utc),
    )


@pytest.fixture(scope="module")
def real_results():
    """Run RealMatcher once with real models for the whole module."""
    matcher = RealMatcher(fixtures_dir=FIXTURES_DIR)
    bundle = _make_bundle()
    return asyncio.run(matcher.match("student-x", "any-programme", bundle))


@pytest.fixture(scope="module")
def fixtures():
    return load_all_fixtures(FIXTURES_DIR)


@pytest.fixture(scope="module")
def gold_by_pair(fixtures):
    return {
        (fx.source.code, fx.target.code): fx.expected
        for fx in fixtures
    }


def test_real_matcher_returns_one_result_per_fixture(real_results, fixtures):
    assert len(real_results) == len(fixtures)


def test_fixture_001_is_classified_direct(real_results):
    r = next(
        x for x in real_results
        if x.source_course_id == "CS-341" and x.target_course_id == "CS-501"
    )
    assert classify(r, {}) == RecognitionStatus.DIRECT
    assert r.outcome_coverage >= 0.90
    assert r.semantic_score >= 0.85
    assert r.assessment_match >= 0.90
    assert r.missing_outcomes == []
    assert r.domain_alignment is True
    assert r.credit_compatibility is True


def test_fixture_002_is_classified_bridge(real_results):
    r = next(
        x for x in real_results
        if x.source_course_id == "CS-201" and x.target_course_id == "CS-502"
    )
    assert classify(r, {}) == RecognitionStatus.BRIDGE
    assert 0.60 <= r.outcome_coverage <= 0.75
    assert len(r.missing_outcomes) == 2
    # missing outcomes must include the two gold ones (case-insensitive)
    lowered = [m.lower() for m in r.missing_outcomes]
    assert any("amortized" in m for m in lowered)
    assert any("dynamic programming" in m for m in lowered)


def test_fixture_003_is_classified_bridge_with_assessment_gap(real_results):
    r = next(
        x for x in real_results
        if x.source_course_id == "BCA-101" and x.target_course_id == "CS-101"
    )
    assert classify(r, {}) == RecognitionStatus.BRIDGE
    assert 0.65 <= r.outcome_coverage <= 0.80
    assert r.assessment_match <= 0.75
    assert len(r.missing_outcomes) == 1
    assert "laboratory" in r.missing_outcomes[0].lower()


def test_all_eight_signals_populated_for_every_result(real_results):
    for r in real_results:
        assert 0.0 <= r.semantic_score <= 1.0
        assert 0.0 <= r.outcome_coverage <= 1.0
        assert isinstance(r.prerequisite_status, bool)
        assert 0.0 <= r.assessment_match <= 1.0
        assert isinstance(r.credit_compatibility, bool)
        assert isinstance(r.domain_alignment, bool)
        assert isinstance(r.policy_eligibility, bool)
        assert 0.0 <= r.evidence_quality <= 1.0
        assert len(r.evidence) >= 1
        assert r.evidence[0].similarity == pytest.approx(r.semantic_score)


def test_evidence_refs_have_provenance(real_results):
    for r in real_results:
        ref = r.evidence[0]
        assert ref.source_doc_id
        assert ref.source_page
        assert ref.target_doc_id
        assert ref.target_page
        assert 0.0 <= ref.similarity <= 1.0


def test_real_and_stub_produce_same_statuses(real_results):
    """The RealMatcher is a drop-in replacement for StubMatcher.

    Both must produce the SAME recognizer status for every fixture.
    """
    stub_results = asyncio.run(
        StubMatcher(fixtures_dir=FIXTURES_DIR).match(
            "student-x", "any-programme", _make_bundle()
        )
    )
    # Map by (source, target) pair
    real_by_pair = {
        (r.source_course_id, r.target_course_id): classify(r, {})
        for r in real_results
    }
    stub_by_pair = {
        (r.source_course_id, r.target_course_id): classify(r, {})
        for r in stub_results
    }

    common_pairs = set(real_by_pair.keys()) & set(stub_by_pair.keys())
    assert len(common_pairs) >= 3, (
        f"only {len(common_pairs)} overlapping pairs found"
    )
    for pair in common_pairs:
        assert real_by_pair[pair] == stub_by_pair[pair], (
            f"real classified {pair} as {real_by_pair[pair]}, "
            f"stub classified as {stub_by_pair[pair]}"
        )


def test_bundle_threshold_respected(real_results):
    """Bundle's retrieval_threshold drives coverage.

    With the current threshold (0.70), every fixture has >0 coverage.
    Lowering the threshold to 0.99 must strictly reduce or equal coverage.
    """
    matcher = RealMatcher(fixtures_dir=FIXTURES_DIR)
    high = asyncio.run(
        matcher.match("s", "t", _make_bundle(threshold=0.99))
    )
    for r in high:
        # Cross-encoder of joined texts is ~0.9999, so 0.99 threshold
        # may still pass at the joined-text level. But per-outcome
        # coverage should not increase.
        base = next(
            x for x in real_results
            if x.source_course_id == r.source_course_id
            and x.target_course_id == r.target_course_id
        )
        assert r.outcome_coverage <= base.outcome_coverage + 1e-9


def test_fixture_001_missing_outcomes_empty(real_results, gold_by_pair):
    gold = gold_by_pair[("CS-341", "CS-501")]
    r = next(
        x for x in real_results
        if x.source_course_id == "CS-341" and x.target_course_id == "CS-501"
    )
    assert r.missing_outcomes == []
    assert gold["status"] == "DIRECT"


def test_fixture_002_missing_outcomes_match_gold_count(real_results, gold_by_pair):
    gold = gold_by_pair[("CS-201", "CS-502")]
    r = next(
        x for x in real_results
        if x.source_course_id == "CS-201" and x.target_course_id == "CS-502"
    )
    assert len(r.missing_outcomes) == len(gold["missing_outcomes"])


def test_fixture_003_missing_outcomes_match_gold_count(real_results, gold_by_pair):
    gold = gold_by_pair[("BCA-101", "CS-101")]
    r = next(
        x for x in real_results
        if x.source_course_id == "BCA-101" and x.target_course_id == "CS-101"
    )
    assert len(r.missing_outcomes) == len(gold["missing_outcomes"])
