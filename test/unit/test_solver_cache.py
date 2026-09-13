import pytest
from services.solver.cache import SolverCache
from services.schemas import (
    SolveRequest, SolveResponse, SolverStatus, DecisionBundle, Pathway, PathwayMode, TermPlan,
)
from datetime import datetime, timezone
from uuid import uuid4


def make_bundle(v="v1"):
    return DecisionBundle(
        id=uuid4(), curriculum_version=v, policy_version="p1",
        model_version="m1", prompt_version="p1",
        embedding_model_version="e1", cross_encoder_version="c1",
        retrieval_threshold=0.7, solver_version="s1",
        solver_parameters_hash="h1", resource_catalog_version="r1",
        ontology_version="o1", ruleset_commit="git1",
        tool_definitions_hash="t1",
        captured_at=datetime.now(timezone.utc),
    )


def test_cache_key_deterministic():
    req1 = SolveRequest("s1", "X", make_bundle(), [], [], [])
    req2 = SolveRequest("s1", "X", make_bundle(), [], [], [])
    assert SolverCache.compute_key(req1) == SolverCache.compute_key(req2)


def test_cache_key_differs_on_curriculum():
    req1 = SolveRequest("s1", "X", make_bundle("v1"), [], [], [])
    req2 = SolveRequest("s1", "X", make_bundle("v2"), [], [], [])
    assert SolverCache.compute_key(req1) != SolverCache.compute_key(req2)


@pytest.mark.asyncio
async def test_cache_put_and_get():
    cache = SolverCache()
    req = SolveRequest("s1", "BTech-CSE", make_bundle(), [], [], [])
    resp = SolveResponse(
        pathways=[
            Pathway(
                mode=PathwayMode.BALANCED,
                terms=4,
                bridge_burden=0.5,
                terms_plan=[TermPlan(term_number=1, courses=["CS-101"], bridges=[])],
            )
        ],
        solver_status=SolverStatus.OPTIMAL,
        solve_time_ms=15,
    )

    await cache.put(req, resp)
    cached = await cache.get(req)
    assert cached is not None
    assert cached.solver_status == SolverStatus.OPTIMAL
    assert cached.solve_time_ms == 0
    assert len(cached.pathways) == 1
