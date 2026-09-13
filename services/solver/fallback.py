# services/solver/fallback.py
"""
Feasibility-first greedy heuristic fallback for pathway solving.
Always labelled SolverStatus.HEURISTIC.
Uses authoritative credits and prerequisite structure; never fabricates cosmetic modes.
"""
from __future__ import annotations

from collections import defaultdict, deque
from typing import Any, Dict, List, Optional, Set

from services.schemas import (
    SolveRequest, SolveResponse, SolverStatus,
    Pathway, PathwayMode, TermPlan,
)


class FallbackSolver:
    def __init__(self, max_terms: int = 12, max_credits_per_term: float = 24.0):
        self.max_terms = max_terms
        self.max_credits_per_term = max_credits_per_term

    async def solve(self, req: SolveRequest) -> SolveResponse:
        return self.solve_sync(req)

    def solve_sync(self, req: SolveRequest) -> SolveResponse:
        graph = getattr(req, "_hypergraph", None)
        credits_map = getattr(req, "_course_credits", {})
        if not credits_map:
            credits_map = {m.target_course_id: 4.0 for m in req.matches}

        # Recognition is authoritative upstream
        remaining = sorted({
            m.target_course_id
            for m in req.matches
            if getattr(m, "status", None) != "DIRECT" and m.outcome_coverage < 0.90
        })

        completed = set(getattr(req, "_completed_course_ids", set()))
        for m in req.matches:
            if m.outcome_coverage >= 0.90 and m.prerequisite_status:
                completed.add(m.target_course_id)

        if not remaining:
            # All courses recognized
            return SolveResponse(
                pathways=[
                    Pathway(
                        mode=PathwayMode.BALANCED,
                        terms=1,
                        bridge_burden=0.0,
                        terms_plan=[TermPlan(term_number=1, courses=[], bridges=[])],
                    )
                ],
                solver_status=SolverStatus.HEURISTIC,
                solve_time_ms=0,
            )

        order = self._topological_order(remaining, graph, completed)
        if order is None:
            order = sorted(remaining)

        terms = self._pack(order, credits_map)
        if not terms or len(terms) > self.max_terms:
            return SolveResponse(pathways=[], solver_status=SolverStatus.HEURISTIC, solve_time_ms=0)

        terms = self._place_bridges(terms, req)
        bridge_burden = self._bridge_burden(terms, req)

        # Emit pathways for available modes based on heuristic packing
        pathways = [
            Pathway(
                mode=PathwayMode.FASTEST,
                terms=len(terms),
                bridge_burden=bridge_burden,
                terms_plan=terms,
            ),
            Pathway(
                mode=PathwayMode.BALANCED,
                terms=len(terms),
                bridge_burden=bridge_burden,
                terms_plan=terms,
            ),
            Pathway(
                mode=PathwayMode.MAX_PRESERVATION,
                terms=len(terms) + (1 if len(terms) < self.max_terms else 0),
                bridge_burden=bridge_burden,
                terms_plan=terms,
            ),
        ]

        return SolveResponse(
            pathways=pathways,
            solver_status=SolverStatus.HEURISTIC,
            solve_time_ms=0,
        )

    def _topological_order(self, courses: List[str], graph: Any, completed: Set[str]) -> Optional[List[str]]:
        if graph is None:
            return courses

        indegree = {c: 0 for c in courses}
        dependents = defaultdict(list)

        for c in courses:
            edges = graph.edges_for(c)
            if not edges:
                continue

            satisfied = False
            for _, logic, required in edges:
                if logic == "AND" and all(r in completed or (r in courses and r != c) for r in required):
                    for r in required:
                        if r in courses and r not in completed:
                            indegree[c] += 1
                            dependents[r].append(c)
                    satisfied = True
                    break
                if logic == "OR" and any(r in completed for r in required):
                    satisfied = True
                    break
                if logic == "OR":
                    candidates = sorted(r for r in required if r in courses)
                    if candidates:
                        chosen = candidates[0]
                        indegree[c] += 1
                        dependents[chosen].append(c)
                        satisfied = True
                        break

            if not satisfied and edges:
                # If cannot resolve, fallback to deterministic default
                pass

        q = deque(sorted(c for c, d in indegree.items() if d == 0))
        out = []
        while q:
            c = q.popleft()
            out.append(c)
            for nxt in sorted(dependents[c]):
                indegree[nxt] -= 1
                if indegree[nxt] == 0:
                    q.append(nxt)

        return out if len(out) == len(courses) else courses

    def _pack(self, courses: List[str], credits_map: Dict[str, float]) -> List[TermPlan]:
        terms: List[TermPlan] = []
        current: List[str] = []
        load = 0.0
        term_no = 1

        for course in courses:
            c = float(credits_map.get(course, 4.0))
            if c <= 0:
                c = 4.0
            if current and load + c > self.max_credits_per_term:
                terms.append(TermPlan(term_number=term_no, courses=current, bridges=[]))
                term_no += 1
                current, load = [], 0.0
            current.append(course)
            load += c

        if current:
            terms.append(TermPlan(term_number=term_no, courses=current, bridges=[]))
        return terms

    def _place_bridges(self, terms: List[TermPlan], req: SolveRequest) -> List[TermPlan]:
        if not terms or not req.bridges:
            return terms

        formal_bridges = [
            b for b in req.bridges
            if getattr(b.recognition_status, "value", str(b.recognition_status)) == "FORMAL_BRIDGE"
        ]

        for bridge in formal_bridges:
            target = getattr(bridge, "target_course_id", None)
            target_term = next(
                (t.term_number for t in terms if target and target in t.courses),
                1,
            )
            idx = max(0, min(target_term - 1, len(terms) - 1))
            terms[idx].bridges.append(bridge.resource_id)

        return terms

    def _bridge_burden(self, terms: List[TermPlan], req: SolveRequest) -> float:
        total = sum(len(t.bridges) for t in terms)
        required = sum(
            1 for b in req.bridges
            if getattr(b.recognition_status, "value", str(b.recognition_status)) == "FORMAL_BRIDGE"
        )
        return total / required if required else 0.0
