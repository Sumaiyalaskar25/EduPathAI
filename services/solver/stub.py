# services/solver/stub.py
from __future__ import annotations

from services.schemas import SolveRequest, SolveResponse, Pathway, PathwayMode, TermPlan, SolverStatus


class StubSolver:
    async def solve(self, req: SolveRequest) -> SolveResponse:
        courses = [m.target_course_id for m in req.matches] or ["CS-501"]
        bridge_ids = [b.resource_id for b in req.bridges]
        return SolveResponse(
            pathways=[
                Pathway(
                    mode=PathwayMode.FASTEST,
                    terms=4,
                    bridge_burden=0.8,
                    terms_plan=[
                        TermPlan(term_number=1, courses=courses[:2], bridges=bridge_ids[:1]),
                        TermPlan(term_number=2, courses=courses[2:4], bridges=bridge_ids[1:2]),
                        TermPlan(term_number=3, courses=courses[4:6], bridges=[]),
                        TermPlan(term_number=4, courses=courses[6:], bridges=[]),
                    ],
                ),
                Pathway(
                    mode=PathwayMode.BALANCED,
                    terms=5,
                    bridge_burden=0.5,
                    terms_plan=[
                        TermPlan(term_number=1, courses=courses[:2], bridges=bridge_ids[:1]),
                        TermPlan(term_number=2, courses=courses[2:3], bridges=bridge_ids[1:]),
                        TermPlan(term_number=3, courses=courses[3:5], bridges=[]),
                        TermPlan(term_number=4, courses=courses[5:7], bridges=[]),
                        TermPlan(term_number=5, courses=courses[7:], bridges=[]),
                    ],
                ),
                Pathway(
                    mode=PathwayMode.MAX_PRESERVATION,
                    terms=5,
                    bridge_burden=0.2,
                    terms_plan=[
                        TermPlan(term_number=1, courses=courses[:1], bridges=bridge_ids),
                        TermPlan(term_number=2, courses=courses[1:3], bridges=[]),
                        TermPlan(term_number=3, courses=courses[3:5], bridges=[]),
                        TermPlan(term_number=4, courses=courses[5:7], bridges=[]),
                        TermPlan(term_number=5, courses=courses[7:], bridges=[]),
                    ],
                ),
            ],
            solver_status=SolverStatus.OPTIMAL,
            solve_time_ms=1200,
        )
