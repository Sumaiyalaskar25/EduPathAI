# test/integration/test_decision_loop.py
"""End-to-end test: fixtures → recognizer → bridges → solver → audit."""
import pytest

from services.api.orchestrator import Orchestrator
from services.matching.stub import StubMatcher
from services.solver.stub import StubSolver
from services.bridge.resource_registry import ResourceRegistry
from services.recognition.recognizer import classify
from services.schemas import MatchResult, RecognitionStatus
from services.audit.ledger import Ledger
from services.outbox.outbox import Outbox
from services.snapshot.bundle_provider import DecisionBundleProvider
from services.policy.loader import PolicyLoader


def test_recognizer_direct():
    """fixture_001: DBMS → Database Systems should classify DIRECT."""
    match = MatchResult(
        source_course_id="CS-341", target_course_id="CS-501",
        semantic_score=0.95, outcome_coverage=0.95,
        prerequisite_status=True, assessment_match=1.0,
        credit_compatibility=True, domain_alignment=True,
        policy_eligibility=True, evidence_quality=0.9,
    )
    assert classify(match, {}) == RecognitionStatus.DIRECT


def test_recognizer_bridge_missing_outcomes():
    """fixture_002: Data Structures → Advanced Algorithms should classify BRIDGE."""
    match = MatchResult(
        source_course_id="CS-201", target_course_id="CS-502",
        semantic_score=0.80, outcome_coverage=0.68,
        prerequisite_status=True, assessment_match=1.0,
        credit_compatibility=True, domain_alignment=True,
        policy_eligibility=True, evidence_quality=0.9,
        missing_outcomes=["amortized analysis", "dynamic programming"],
    )
    assert classify(match, {}) == RecognitionStatus.BRIDGE


def test_recognizer_assessment_gap():
    """fixture_003: BCA C → B.Tech PDS should classify BRIDGE with assessment gap."""
    match = MatchResult(
        source_course_id="BCA-101", target_course_id="CS-101",
        semantic_score=0.90, outcome_coverage=0.92,
        prerequisite_status=True, assessment_match=0.60,
        credit_compatibility=True, domain_alignment=True,
        policy_eligibility=True, evidence_quality=0.9,
        missing_outcomes=["laboratory project"],
    )
    assert classify(match, {}) == RecognitionStatus.BRIDGE


def test_recognizer_policy_conflict():
    match = MatchResult(
        source_course_id="X", target_course_id="Y",
        semantic_score=0.95, outcome_coverage=0.95,
        prerequisite_status=True, assessment_match=1.0,
        credit_compatibility=True, domain_alignment=True,
        policy_eligibility=False, evidence_quality=0.9,
    )
    assert classify(match, {}) == RecognitionStatus.POLICY_CONFLICT


@pytest.mark.asyncio
async def test_full_decision_loop_orchestration():
    orchestrator = Orchestrator(
        bundle_provider=DecisionBundleProvider(),
        matcher=StubMatcher(),
        solver=StubSolver(),
        ledger=Ledger(),
        outbox=Outbox(),
        resources=ResourceRegistry(),
        policy_loader=PolicyLoader(),
    )

    resp = await orchestrator.run("student-001", "BTech-CSE", "IIT-Bombay")
    assert resp.recognition.direct >= 1
    assert resp.recognition.bridge >= 1
    assert len(resp.pathways) == 3
    assert resp.decision_id is not None
    assert resp.trace_id is not None
    assert len(resp.audit_event_ids) == 1

    # Verify audit chain
    await orchestrator.ledger.verify("IIT-Bombay")
