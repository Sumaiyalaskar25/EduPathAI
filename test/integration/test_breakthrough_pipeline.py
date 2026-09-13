import asyncio
import pytest
from uuid import uuid4
from datetime import datetime, timezone

from services.schemas import (
    DecisionBundle, SolveRequest, MatchResult, Gap, GapType,
)
from services.recognition.bitset_prerequisites import BitsetHypergraph
from services.solver.decomposed_milp import DecomposedMILPSolver
from services.solver.incremental_planner import IncrementalPlanner
from services.matching.batch_matcher import AsyncBatchProcessor


def make_bundle() -> DecisionBundle:
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


@pytest.mark.asyncio
async def test_decomposed_milp_and_incremental_planner():
    solver = DecomposedMILPSolver(max_terms=6, max_credits=20.0)
    matches = [
        MatchResult(
            source_course_id=f"S-{i}",
            target_course_id=f"CS-{500 + i}",
            semantic_score=0.8,
            outcome_coverage=0.8 if i > 1 else 0.95,
            prerequisite_status=True,
            assessment_match=1.0,
            credit_compatibility=True,
            domain_alignment=True,
            policy_eligibility=True,
            evidence_quality=0.9,
        )
        for i in range(1, 7)
    ]

    req = SolveRequest(
        student_id="student-breakthrough-01",
        target_programme="BTech-CSE",
        bundle=make_bundle(),
        matches=matches,
        gaps=[],
        bridges=[],
    )

    resp = await solver.solve(req)
    assert resp.solve_time_ms < 50
    assert len(resp.pathways) == 3

    # Test incremental planning
    bg = BitsetHypergraph(num_courses=64)
    bg.add_and_prereqs("CS-503", ["CS-501"])
    planner = IncrementalPlanner(bg)

    pathway = resp.pathways[1]  # BALANCED
    planner.register_plan(
        student_id=req.student_id,
        completed_ids={"CS-501"},
        frontier=["CS-502"],
        pathway=pathway,
    )

    # Replan when CS-502 is completed
    re_pathway = planner.incremental_replan(req.student_id, "CS-502")
    assert re_pathway is not None
    assert re_pathway.mode == pathway.mode


@pytest.mark.asyncio
async def test_async_batch_processor():
    processor = AsyncBatchProcessor(batch_size=5, max_concurrency=3)
    items = list(range(23))

    async def mock_batch_worker(batch):
        await asyncio.sleep(0.01)
        return [x * 2 for x in batch]

    results = await processor.process_all(items, mock_batch_worker)
    assert len(results) == 23
    assert results == [x * 2 for x in range(23)]
