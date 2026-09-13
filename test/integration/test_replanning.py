# test/integration/test_replanning.py
"""Re-planning: student completes a bridge, pathway shifts."""
import pytest
from services.api.orchestrator import Orchestrator
from services.matching.stub import StubMatcher
from services.solver.stub import StubSolver
from services.bridge.resource_registry import ResourceRegistry
from services.audit.ledger import Ledger
from services.outbox.outbox import Outbox
from services.snapshot.bundle_provider import DecisionBundleProvider
from services.policy.loader import PolicyLoader
from services.schemas import MatchResult


class DynamicMatcher(StubMatcher):
    """Simulates student transcript updates after completing bridge courses."""
    def __init__(self):
        super().__init__()
        self.completed_bridges: set[str] = set()

    async def match(self, student_id: str, target_programme: str, bundle):
        base_matches = await super().match(student_id, target_programme, bundle)
        updated = []
        for m in base_matches:
            # If student completed the bridge for Data Structures -> Advanced Algorithms
            if "nptel-algorithms-2026" in self.completed_bridges and m.target_course_id == "CS-502":
                updated.append(MatchResult(
                    source_course_id=m.source_course_id,
                    target_course_id=m.target_course_id,
                    semantic_score=0.95,
                    outcome_coverage=0.95,
                    prerequisite_status=True,
                    assessment_match=1.0,
                    credit_compatibility=True,
                    domain_alignment=True,
                    policy_eligibility=True,
                    evidence_quality=0.95,
                    evidence=m.evidence,
                    missing_outcomes=[],
                ))
            else:
                updated.append(m)
        return updated


@pytest.mark.asyncio
async def test_replan_after_bridge_completion():
    matcher = DynamicMatcher()
    orchestrator = Orchestrator(
        bundle_provider=DecisionBundleProvider(),
        matcher=matcher,
        solver=StubSolver(),
        ledger=Ledger(),
        outbox=Outbox(),
        resources=ResourceRegistry(),
        policy_loader=PolicyLoader(),
    )

    # Initial request
    r1 = await orchestrator.run("student-001", "BTech-CSE", "IIT-Bombay")
    assert r1.recognition.bridge >= 1

    # Student completes NPTEL bridge course
    matcher.completed_bridges.add("nptel-algorithms-2026")

    # Re-request pathway
    r2 = await orchestrator.run("student-001", "BTech-CSE", "IIT-Bombay")

    # Assert pathway shifted dynamically
    assert r2.recognition.direct > r1.recognition.direct
    assert r2.recognition.bridge < r1.recognition.bridge
    assert r2.decision_id != r1.decision_id  # New distinct decision

    # Assert audit chain is cryptographically intact across re-plans
    await orchestrator.ledger.verify("IIT-Bombay")
