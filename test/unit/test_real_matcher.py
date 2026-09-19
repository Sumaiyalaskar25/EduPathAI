# test/unit/test_real_matcher.py
"""Unit tests for services.matching.real.

The cross-encoder and coverage.rerank are MONKEYPATCHED so these tests
are fast and deterministic. Real-model behaviour is asserted in
test_cross_encoder.py, test_coverage.py, and (later) the integration
test that runs the full pipeline on the real fixtures.
"""
from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from uuid import uuid4

import pytest

import services.matching.coverage as coverage_mod
import services.matching.real as real_mod
from services.matching.real import RealMatcher
from services.schemas import DecisionBundle, MatchResult


def _make_bundle(threshold: float = 0.70) -> DecisionBundle:
    return DecisionBundle(
        id=uuid4(),
        curriculum_version="test/v1",
        policy_version="test/v1",
        model_version="test",
        prompt_version="test",
        embedding_model_version="test-embed",
        cross_encoder_version="test-xenc",
        retrieval_threshold=threshold,
        solver_version="test",
        solver_parameters_hash="hash",
        resource_catalog_version="test",
        ontology_version="test",
        ruleset_commit="abc",
        tool_definitions_hash="def",
        captured_at=datetime.now(timezone.utc),
    )


def _install_fake_models(monkeypatch, ce_score: float = 0.92):
    # Patch RealMatcher's score_pair
    monkeypatch.setattr(real_mod, "score_pair", lambda q, c: ce_score)
    # Patch coverage's rerank (called inside compute_outcome_coverage)
    monkeypatch.setattr(
        coverage_mod,
        "rerank",
        lambda query, candidates: [ce_score for _ in candidates],
    )


def test_real_matcher_returns_one_match_per_fixture(monkeypatch):
    _install_fake_models(monkeypatch)
    m = RealMatcher()
    results = asyncio.run(m.match("student-1", "CS-501", _make_bundle()))
    assert len(results) >= 3
    assert all(isinstance(r, MatchResult) for r in results)


def test_real_matcher_signature_compatible_with_stub(monkeypatch):
    """RealMatcher.match() must accept the same args as StubMatcher.match()."""
    _install_fake_models(monkeypatch)
    m = RealMatcher()
    result = asyncio.run(m.match("any-student", "any-programme", _make_bundle()))
    assert isinstance(result, list)
    assert all(isinstance(r, MatchResult) for r in result)


def test_fixture_001_classified_direct_when_signals_high(monkeypatch):
    # Perfect cross-encoder -> full coverage on fixture_001 (identical outcomes)
    _install_fake_models(monkeypatch, ce_score=0.95)
    m = RealMatcher()
    results = asyncio.run(m.match("student-1", "CS-501", _make_bundle()))
    fx1 = next(r for r in results if r.source_course_id == "CS-341")
    assert fx1.outcome_coverage == 1.0
    assert fx1.semantic_score == pytest.approx(0.95)
    assert fx1.credit_compatibility is True
    assert fx1.domain_alignment is True
    assert fx1.missing_outcomes == []


def test_fixture_002_has_missing_outcomes_when_signals_low(monkeypatch):
    # Low cross-encoder -> nothing matches -> all targets missing
    _install_fake_models(monkeypatch, ce_score=0.10)
    m = RealMatcher()
    results = asyncio.run(m.match("student-1", "CS-502", _make_bundle()))
    fx2 = next(r for r in results if r.source_course_id == "CS-201")
    assert fx2.outcome_coverage == 0.0
    assert len(fx2.missing_outcomes) == 6  # all 6 targets in fixture_002


def test_credit_compatibility_detects_mismatch(monkeypatch):
    # fixture_003: 3.0 vs 4.0 -> difference 25% -> boundary case
    _install_fake_models(monkeypatch, ce_score=0.80)
    m = RealMatcher()
    results = asyncio.run(m.match("student-1", "CS-101", _make_bundle()))
    fx3 = next(r for r in results if r.source_course_id == "BCA-101")
    # abs(3-4)/4 = 0.25 -> exactly at boundary -> True
    assert fx3.credit_compatibility is True


def test_assessment_match_detects_lab_gap(monkeypatch):
    _install_fake_models(monkeypatch, ce_score=0.80)
    m = RealMatcher()
    results = asyncio.run(m.match("student-1", "CS-101", _make_bundle()))
    fx3 = next(r for r in results if r.source_course_id == "BCA-101")
    # source=theory, target=theory+lab -> 0.5
    assert fx3.assessment_match == 0.5


def test_same_domain_yields_true(monkeypatch):
    _install_fake_models(monkeypatch)
    m = RealMatcher()
    results = asyncio.run(m.match("student-1", "CS-501", _make_bundle()))
    for r in results:
        # all three fixtures are CS <-> CS
        assert r.domain_alignment is True


def test_evidence_refs_populated(monkeypatch):
    _install_fake_models(monkeypatch)
    m = RealMatcher()
    results = asyncio.run(m.match("student-1", "CS-501", _make_bundle()))
    for r in results:
        assert len(r.evidence) == 1
        assert r.evidence[0].source_doc_id.endswith("-source")
        assert r.evidence[0].target_doc_id.endswith("-target")
        assert r.evidence[0].similarity == r.semantic_score


def test_all_eight_signals_populated(monkeypatch):
    _install_fake_models(monkeypatch)
    m = RealMatcher()
    results = asyncio.run(m.match("student-1", "CS-501", _make_bundle()))
    for r in results:
        # every field must be populated with a sane value
        assert 0.0 <= r.semantic_score <= 1.0
        assert 0.0 <= r.outcome_coverage <= 1.0
        assert isinstance(r.prerequisite_status, bool)
        assert 0.0 <= r.assessment_match <= 1.0
        assert isinstance(r.credit_compatibility, bool)
        assert isinstance(r.domain_alignment, bool)
        assert isinstance(r.policy_eligibility, bool)
        assert 0.0 <= r.evidence_quality <= 1.0


def test_retrieval_threshold_used_from_bundle(monkeypatch):
    """Bundle's retrieval_threshold must be respected.

    We do NOT assert exact coverage values because the Bloom gate may
    additionally block individual outcomes. We assert directional
    behaviour: high threshold drops coverage to 0, low threshold
    raises it above 0 for at least one fixture.
    """

    def fake_rerank(query, candidates):
        return [0.75 for _ in candidates]

    monkeypatch.setattr(real_mod, "score_pair", lambda q, c: 0.75)
    monkeypatch.setattr(coverage_mod, "rerank", fake_rerank)

    m = RealMatcher()

    # High threshold (0.90 > 0.75) -> cross-encoder blocks every outcome
    high_results = asyncio.run(
        m.match("s", "t", _make_bundle(threshold=0.90))
    )
    for r in high_results:
        assert r.outcome_coverage == 0.0, (
            f"expected 0 coverage at threshold 0.90, got {r.outcome_coverage}"
        )

    # Low threshold (0.50 < 0.75) -> cross-encoder no longer blocks;
    # coverage must improve compared to the high-threshold run.
    low_results = asyncio.run(
        m.match("s", "t", _make_bundle(threshold=0.50))
    )
    improved = [r for r in low_results if r.outcome_coverage > 0.0]
    assert len(improved) >= 1, (
        "lowering the retrieval threshold must allow at least one match"
    )
