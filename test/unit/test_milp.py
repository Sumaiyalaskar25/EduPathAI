import pytest
from services.solver.milp import MILPSolver
from services.schemas import (
    SolveRequest, DecisionBundle, MatchResult, Gap, Bridge,
    SolverStatus, PathwayMode, BridgeMode,
)
from datetime import datetime, timezone
from uuid import uuid4


def make_bundle():
    return DecisionBundle(
        id=uuid4(),
        curriculum_version="v1", policy_version="v1",
        model_version="m1", prompt_version="p1",
        embedding_model_version="e1", cross_encoder_version="c1",
        retrieval_threshold=0.7, solver_version="s1",
        solver_parameters_hash="h1", resource_catalog_version="r1",
        ontology_version="o1", ruleset_commit="git1",
        tool_definitions_hash="t1",
        captured_at=datetime.now(timezone.utc),
    )


def make_match(tgt: str, coverage: float = 0.5):
    return MatchResult(
        source_course_id="SRC", target_course_id=tgt,
        semantic_score=coverage, outcome_coverage=coverage,
        prerequisite_status=True, assessment_match=1.0,
        credit_compatibility=True, domain_alignment=True,
        policy_eligibility=True, evidence_quality=0.9,
        evidence=[], missing_outcomes=[],
    )


@pytest.mark.asyncio
async def test_milp_produces_3_modes():
    solver = MILPSolver(timeout_seconds=5)
    req = SolveRequest(
        student_id="s1", target_programme="BTech-CSE",
        bundle=make_bundle(),
        matches=[make_match(f"CS-{i}") for i in range(6)],
        gaps=[], bridges=[],
    )
    resp = await solver.solve(req)
    assert resp.solver_status in (SolverStatus.OPTIMAL, SolverStatus.FEASIBLE_NOT_OPTIMAL)
    assert len(resp.pathways) == 3
    modes = {p.mode for p in resp.pathways}
    assert modes == {PathwayMode.FASTEST, PathwayMode.BALANCED, PathwayMode.MAX_PRESERVATION}


@pytest.mark.asyncio
async def test_milp_respects_credit_limit():
    solver = MILPSolver(max_credits_per_term=12, timeout_seconds=5)
    req = SolveRequest(
        student_id="s1", target_programme="X",
        bundle=make_bundle(),
        matches=[make_match(f"CS-{i}") for i in range(8)],
        gaps=[], bridges=[],
    )
    resp = await solver.solve(req)
    for pathway in resp.pathways:
        for term in pathway.terms_plan:
            # 4 credits per course, max 12 -> max 3 courses per term
            assert len(term.courses) <= 3
