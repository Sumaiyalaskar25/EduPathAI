# services/recognition/prerequisites.py
"""Prerequisite hypergraph traversal. AND/OR logic."""
from collections import defaultdict
from typing import Set, List, Dict, Tuple


class PrereqHypergraph:
    """
    Stores prerequisite structure as hyperedges.
    A hyperedge is (course_id, hyperedge_id, logic, [required_courses]).
    Multiple hyperedges on a course = OR. Within a hyperedge = AND.
    """

    def __init__(self):
        # course_id -> list of hyperedges
        # each hyperedge = (hyperedge_id, logic, [required_course_ids])
        self._edges: Dict[str, List[Tuple[str, str, List[str]]]] = defaultdict(list)

    def add_edge(self, course_id: str, hyperedge_id: str, logic: str, required: List[str]) -> None:
        self._edges[course_id].append((hyperedge_id, logic, required))

    def is_unlocked(self, course_id: str, completed: Set[str]) -> bool:
        """A course is unlocked if ANY incoming hyperedge is satisfied, or if it has no prereqs."""
        edges = self._edges.get(course_id, [])
        if not edges:
            return True  # no prerequisites
        return any(self._edge_satisfied(edge, completed) for edge in edges)

    @staticmethod
    def _edge_satisfied(edge: Tuple[str, str, List[str]], completed: Set[str]) -> bool:
        _, logic, required = edge
        if logic == "AND":
            return all(r in completed for r in required)
        elif logic == "OR":
            return any(r in completed for r in required)
        return False

    def frontier(self, target_courses: List[str], completed: Set[str]) -> List[str]:
        """Academic Readiness Frontier — courses currently unlocked."""
        return [c for c in target_courses if self.is_unlocked(c, completed)]
