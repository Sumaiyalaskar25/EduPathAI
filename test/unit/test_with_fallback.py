import asyncio
import pytest
from services.solver.with_fallback import SolverWithFallback
from services.solver.fallback import FallbackSolver
from services.schemas import (
    SolveRequest, SolveResponse, SolverStatus,
    Pathway, PathwayMode, TermPlan,
)
from datetime import datetime, timezone
from uuid import uuid4


class SlowSolver:
    async def solve(self, req):
        await asyncio.sleep(100)  # simulate hang
        return SolveResponse(pathways=[], solver_status=SolverStatus.OPTIMAL, solve_time_ms=0)


class FastSolver:
    async def solve(self, req):
        return SolveResponse(
            pathways=[Pathway(mode=PathwayMode.FASTEST, terms=4, bridge_burden=0.5,
                              terms_plan=[TermPlan(term_number=1, courses=[], bridges=[])])],
            solver_status=SolverStatus.OPTIMAL, solve_time_ms=10,
        )


@pytest.mark.asyncio
async def test_timeout_triggers_fallback():
    wrapper = SolverWithFallback(
        primary=SlowSolver(),
        fallback=FallbackSolver(),
        timeout_seconds=0.2,
    )
    req = SolveRequest(
        student_id="s1", target_programme="X",
        bundle=None, matches=[], gaps=[], bridges=[],
    )
    resp = await wrapper.solve(req)
    assert resp.solver_status == SolverStatus.HEURISTIC


@pytest.mark.asyncio
async def test_fast_solver_no_fallback():
    wrapper = SolverWithFallback(
        primary=FastSolver(),
        fallback=FallbackSolver(),
        timeout_seconds=5,
    )
    req = SolveRequest(
        student_id="s1", target_programme="X",
        bundle=None, matches=[], gaps=[], bridges=[],
    )
    resp = await wrapper.solve(req)
    assert resp.solver_status == SolverStatus.OPTIMAL
