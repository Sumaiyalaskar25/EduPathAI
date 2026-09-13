# services/solver/milp.py
"""
Primary Mixed-Integer Linear Programming (MILP) Solver using Google OR-Tools CBC.

Mathematical Formulation:
  Decision Variables:
    z[j, t] in {0,1}   target course j is scheduled in term t (t in 1..T)
    u[b, t] in {0,1}   formal bridge b is completed in term t (t in 1..T)
    w[t] in {0,1}      term t is active
    p[j, t] in {0,1}   course j is completed by end of term t (p[j,0] = 1 for recognized courses)
    y[e, t] in {0,1}   prerequisite hyperedge e is satisfied by end of term t-1

Hard Constraints:
  1. Exactly Once: sum_{t} z[j, t] == 1 for every remaining course j.
  2. Completion Tracking: p[j, t] == p[j, t-1] + z[j, t] for t in 1..T.
  3. Prerequisite Precedence (AND/OR):
     For AND edge e = {r1, r2, ...}: y[e, t] <= p[ri, t-1] for all ri in e.
     Course scheduling gate: z[j, t] <= sum_{e in edges(j)} y[e, t].
  4. Workload Bounds: sum_j c_j * z[j, t] + sum_b 0.5 * u[b, t] <= max_credits * w[t].
  5. Monotonicity: w[t] <= w[t-1] for t in 2..T.
  6. Independent Feasibility Validator: Output must pass validator.
"""
from __future__ import annotations

import logging
import time
from typing import Any, Dict, List, Optional, Set, Tuple

try:
    from ortools.linear_solver import pywraplp
    HAS_ORTOOLS = True
except ImportError:
    pywraplp = None
    HAS_ORTOOLS = False

from services.schemas import (
    SolveRequest, SolveResponse, SolverStatus,
    Pathway, PathwayMode, TermPlan,
)
from services.solver.prereq_loader import PrereqHypergraph
from services.solver.fallback import FallbackSolver
from services.solver.validator import PathwayValidator

log = logging.getLogger(__name__)


MODE_WEIGHTS = {
    PathwayMode.FASTEST: {
        "time": 3.0, "bridge": 0.5, "preservation": 0.5,
    },
    PathwayMode.BALANCED: {
        "time": 1.0, "bridge": 1.0, "preservation": 1.0,
    },
    PathwayMode.MAX_PRESERVATION: {
        "time": 0.5, "bridge": 0.3, "preservation": 3.0,
    },
}


class MILPSolver:
    def __init__(
        self,
        max_terms: int = 12,
        max_credits_per_term: float = 24.0,
        min_credits_per_term: float = 12.0,
        final_term_exception: bool = True,
        timeout_seconds: int = 30,
        validator: PathwayValidator | None = None,
    ):
        self.max_terms = max_terms
        self.max_credits_per_term = max_credits_per_term
        self.min_credits_per_term = min_credits_per_term
        self.final_term_exception = final_term_exception
        self.timeout_seconds = timeout_seconds
        self.validator = validator or PathwayValidator(
            min_credits_per_term=min_credits_per_term,
            max_credits_per_term=max_credits_per_term,
            max_total_terms=max_terms,
        )
        self._fallback = FallbackSolver(max_terms=max_terms, max_credits_per_term=max_credits_per_term)

    async def solve(self, req: SolveRequest) -> SolveResponse:
        """Asynchronous solve method conforming to frozen solver protocol."""
        return self.solve_sync(req)

    def solve_sync(self, req: SolveRequest) -> SolveResponse:
        """Synchronous solve method (can be run via asyncio.to_thread)."""
        return self.solve_all_modes_sync(req)

    def solve_all_modes_sync(self, req: SolveRequest) -> SolveResponse:
        """
        Solves for all 3 modes (FASTEST, BALANCED, MAX_PRESERVATION) with distinct objective weights.
        """
        if self.timeout_seconds <= 0 or not HAS_ORTOOLS or pywraplp is None:
            return self._fallback.solve_sync(req)

        start = time.perf_counter()
        pathways: List[Pathway] = []
        statuses: List[SolverStatus] = []

        for mode in [PathwayMode.FASTEST, PathwayMode.BALANCED, PathwayMode.MAX_PRESERVATION]:
            pathway, status = self._solve_for_mode(req, mode)
            if pathway:
                pathways.append(pathway)
            statuses.append(status)

        # If any mode failed to solve or returned empty, fallback gracefully
        if len(pathways) < 3:
            fallback_resp = self._fallback.solve_sync(req)
            fallback_resp.solve_time_ms = int((time.perf_counter() - start) * 1000)
            return fallback_resp

        # Determine aggregate solver status (worst status wins)
        if any(s == SolverStatus.HEURISTIC for s in statuses):
            final_status = SolverStatus.HEURISTIC
        elif any(s == SolverStatus.FEASIBLE_NOT_OPTIMAL for s in statuses):
            final_status = SolverStatus.FEASIBLE_NOT_OPTIMAL
        elif all(s == SolverStatus.OPTIMAL for s in statuses):
            final_status = SolverStatus.OPTIMAL
        else:
            final_status = SolverStatus.FEASIBLE_NOT_OPTIMAL

        elapsed_ms = int((time.perf_counter() - start) * 1000)
        return SolveResponse(
            pathways=pathways,
            solver_status=final_status,
            solve_time_ms=elapsed_ms,
        )

    def _solve_for_mode(self, req: SolveRequest, mode: PathwayMode) -> Tuple[Optional[Pathway], SolverStatus]:
        if not HAS_ORTOOLS or pywraplp is None:
            return None, SolverStatus.FEASIBLE_NOT_OPTIMAL

        solver = pywraplp.Solver.CreateSolver("CBC")
        if solver is None:
            return None, SolverStatus.FEASIBLE_NOT_OPTIMAL

        solver.SetTimeLimit(max(1, self.timeout_seconds * 1000))

        # 1. Authoritative Data Extraction
        all_courses = sorted(set(m.target_course_id for m in req.matches))
        credits_map = getattr(req, "_course_credits", {})
        if not credits_map:
            credits_map = {m.target_course_id: 4.0 for m in req.matches}

        recognized_courses = set(getattr(req, "_completed_course_ids", set()))
        for m in req.matches:
            if m.outcome_coverage >= 0.90 and m.prerequisite_status:
                recognized_courses.add(m.target_course_id)

        remaining_courses = [c for c in all_courses if c not in recognized_courses]
        bridges_needed = [
            b for b in req.bridges
            if getattr(b.recognition_status, "value", str(b.recognition_status)) == "FORMAL_BRIDGE"
        ]
        hypergraph = getattr(req, "_hypergraph", PrereqHypergraph())

        # If no courses remain, return 1-term empty pathway
        if not remaining_courses and not bridges_needed:
            return Pathway(
                mode=mode,
                terms=1,
                bridge_burden=0.0,
                terms_plan=[TermPlan(term_number=1, courses=[], bridges=[])],
            ), SolverStatus.OPTIMAL

        # 2. Decision Variables
        # z[j, t] in {0,1} for j in remaining, t in 1..T
        z: Dict[Tuple[str, int], Any] = {}
        for j in remaining_courses:
            for t in range(1, self.max_terms + 1):
                z[j, t] = solver.IntVar(0, 1, f"z_{j}_{t}")

        # p[j, t] in {0,1} course completion state by term t (including term 0)
        p: Dict[Tuple[str, int], Any] = {}
        for j in all_courses:
            p[j, 0] = 1 if j in recognized_courses else 0
            for t in range(1, self.max_terms + 1):
                if j in recognized_courses:
                    p[j, t] = 1
                else:
                    p[j, t] = solver.IntVar(0, 1, f"p_{j}_{t}")

        # u[b, t] in {0,1} bridge completion in term t
        u: Dict[Tuple[Any, int], Any] = {}
        for b in bridges_needed:
            for t in range(1, self.max_terms + 1):
                u[b.bridge_id, t] = solver.IntVar(0, 1, f"u_{b.bridge_id}_{t}")

        # w[t] in {0,1} term active
        w: Dict[int, Any] = {}
        for t in range(1, self.max_terms + 1):
            w[t] = solver.IntVar(0, 1, f"w_{t}")

        # 3. Hard Constraints
        # (a) Exactly once scheduling for remaining courses
        for j in remaining_courses:
            solver.Add(sum(z[j, t] for t in range(1, self.max_terms + 1)) == 1)

        # (b) Course completion accumulation: p[j, t] == p[j, t-1] + z[j, t]
        for j in remaining_courses:
            for t in range(1, self.max_terms + 1):
                prev = p[j, t - 1]
                if isinstance(prev, int):
                    solver.Add(p[j, t] == prev + z[j, t])
                else:
                    solver.Add(p[j, t] == prev + z[j, t])

        # (c) Bridge exactly once
        for b in bridges_needed:
            solver.Add(sum(u[b.bridge_id, t] for t in range(1, self.max_terms + 1)) == 1)

        # (d) Prerequisite Precedence (AND/OR)
        for j in remaining_courses:
            edges = hypergraph.edges_for(j)
            if edges:
                for t in range(1, self.max_terms + 1):
                    # For each hyperedge e, create y[e, t]
                    y_edge_vars = []
                    for e_idx, (_, logic, required) in enumerate(edges):
                        y_e = solver.IntVar(0, 1, f"y_{j}_{e_idx}_{t}")
                        y_edge_vars.append(y_e)
                        if logic == "AND":
                            # y_e <= p[r, t-1] for all r in required
                            for r in required:
                                if r in p:
                                    solver.Add(y_e <= p[r, t - 1])
                        elif logic == "OR":
                            # y_e <= sum(p[r, t-1])
                            req_p = [p[r, t - 1] for r in required if r in p]
                            if req_p:
                                solver.Add(y_e <= sum(req_p))
                    # Course j can only be taken in term t if at least one prerequisite hyperedge is satisfied
                    solver.Add(z[j, t] <= sum(y_edge_vars))

        # (e) Workload & Active Term Constraints
        for t in range(1, self.max_terms + 1):
            term_credits = sum(
                credits_map.get(j, 4.0) * z[j, t]
                for j in remaining_courses
            )
            bridge_workload = sum(
                0.5 * u[b.bridge_id, t]
                for b in bridges_needed
            )
            # Upper bound on term
            solver.Add(term_credits + bridge_workload <= self.max_credits_per_term * w[t])
            # Course can only be taken if term t is active
            for j in remaining_courses:
                solver.Add(z[j, t] <= w[t])

        # (f) Term Monotonicity: w[t] <= w[t-1]
        for t in range(2, self.max_terms + 1):
            solver.Add(w[t] <= w[t - 1])

        # 4. Multi-Objective Function
        weights = MODE_WEIGHTS[mode]
        completion_time = sum(w[t] for t in range(1, self.max_terms + 1))
        bridge_burden = sum(u[k] for k in u) if u else 0
        preserved_credits = len(recognized_courses)

        objective = (
            weights["time"] * completion_time
            + weights["bridge"] * bridge_burden
            - weights["preservation"] * preserved_credits
        )
        solver.Minimize(objective)

        # 5. Solve
        status_code = solver.Solve()

        if status_code == pywraplp.Solver.OPTIMAL:
            status = SolverStatus.OPTIMAL
        elif status_code == pywraplp.Solver.FEASIBLE:
            status = SolverStatus.FEASIBLE_NOT_OPTIMAL
        else:
            return None, SolverStatus.FEASIBLE_NOT_OPTIMAL

        # 6. Extract Terms Plan
        terms_plan: List[TermPlan] = []
        for t in range(1, self.max_terms + 1):
            if w[t].solution_value() < 0.5:
                continue
            courses = [j for j in remaining_courses if z[j, t].solution_value() > 0.5]
            bridges_in_term = [
                b.resource_id for b in bridges_needed
                if u[b.bridge_id, t].solution_value() > 0.5
            ]
            terms_plan.append(TermPlan(
                term_number=t,
                courses=courses,
                bridges=bridges_in_term,
            ))

        total_terms = max(len(terms_plan), 1)
        total_bridges = sum(len(tp.bridges) for tp in terms_plan)
        burden = min(1.0, total_bridges / max(len(bridges_needed), 1))

        pathway = Pathway(
            mode=mode,
            terms=total_terms,
            bridge_burden=burden,
            terms_plan=terms_plan,
        )

        # 7. Independent Feasibility Validation Gate
        val_report = self.validator.validate_pathway(
            pathway=pathway,
            required_target_courses=set(all_courses),
            initially_completed_courses=recognized_courses,
            hypergraph=hypergraph,
            course_credits_map=credits_map,
        )

        if not val_report.is_valid:
            log.warning("pathway_validation_failed", extra={"errors": val_report.errors})
            return None, SolverStatus.FEASIBLE_NOT_OPTIMAL

        return pathway, status
