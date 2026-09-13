# services/solver/incremental_planner.py
"""
Breakthrough #8: Delta Propagation for Incremental Re-planning.
Avoids full pathway re-solves when a single course or bridge is completed.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Set
from services.schemas import Pathway, PathwayResponse, TermPlan, PathwayMode
from services.recognition.bitset_prerequisites import BitsetHypergraph


@dataclass
class PlanState:
    student_id: str
    completed_ids: Set[str]
    frontier: List[str]
    pathway: Pathway


class IncrementalPlanner:
    def __init__(self, hypergraph: BitsetHypergraph):
        self.hypergraph = hypergraph
        self.states: Dict[str, PlanState] = {}

    def register_plan(self, student_id: str, completed_ids: Set[str], frontier: List[str], pathway: Pathway) -> None:
        self.states[student_id] = PlanState(
            student_id=student_id,
            completed_ids=set(completed_ids),
            frontier=list(frontier),
            pathway=pathway,
        )

    def incremental_replan(self, student_id: str, completed_course: str) -> Pathway | None:
        """
        Incrementally updates terms without re-executing full solver.
        """
        if student_id not in self.states:
            return None

        state = self.states[student_id]
        if completed_course in state.completed_ids:
            return state.pathway  # Already accounted for

        # 1. Update completed bitset
        cm = self.hypergraph.create_completed_mask(state.completed_ids)
        delta_unlocked = self.hypergraph.delta_frontier(
            newly_completed_course=completed_course,
            completed_mask=cm,
            current_frontier=state.frontier,
        )

        state.completed_ids.add(completed_course)
        state.frontier.extend(delta_unlocked)

        # 2. Adjust terms in place: remove completed course from scheduled terms
        new_terms: List[TermPlan] = []
        for tp in state.pathway.terms_plan:
            filtered_courses = [c for c in tp.courses if c != completed_course]
            new_terms.append(TermPlan(
                term_number=tp.term_number,
                courses=filtered_courses,
                bridges=[b for b in tp.bridges if b != completed_course],
            ))

        updated_pathway = Pathway(
            mode=state.pathway.mode,
            terms=len(new_terms),
            bridge_burden=max(0.0, state.pathway.bridge_burden - 0.1),
            terms_plan=new_terms,
        )
        state.pathway = updated_pathway
        return updated_pathway
