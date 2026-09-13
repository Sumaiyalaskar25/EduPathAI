# services/solver/prereq_loader.py
"""
Loads prerequisite hypergraph from PostgreSQL or in-memory fixtures.
Member 1 owns the schema. Member 4 consumes.
"""
from __future__ import annotations

from collections import defaultdict
from typing import Any, Dict, List, Set, Tuple


class PrereqHypergraph:
    """
    In-memory hypergraph representation:
    course_id -> list of hyperedges
    each hyperedge = (hyperedge_id, logic, [required_course_ids])
    """
    def __init__(self):
        self._edges: Dict[str, List[Tuple[str, str, List[str]]]] = defaultdict(list)

    def add_edge(self, course_id: str, hyperedge_id: str, logic: str, required: List[str]) -> None:
        self._edges[course_id].append((hyperedge_id, logic, required))

    def edges_for(self, course_id: str) -> List[Tuple[str, str, List[str]]]:
        return self._edges.get(course_id, [])

    def all_courses(self) -> List[str]:
        return list(self._edges.keys())

    def is_unlocked(self, course_id: str, completed: Set[str]) -> bool:
        edges = self._edges.get(course_id, [])
        if not edges:
            return True
        return any(self._satisfied(e, completed) for e in edges)

    @staticmethod
    def _satisfied(edge: Tuple[str, str, List[str]], completed: Set[str]) -> bool:
        _, logic, required = edge
        if logic == "AND":
            return all(r in completed for r in required)
        if logic == "OR":
            return any(r in completed for r in required)
        return False


class PrereqLoader:
    def __init__(self, db: Any = None):
        self.db = db

    async def load(self, curriculum_id: str) -> PrereqHypergraph:
        hypergraph = PrereqHypergraph()
        if self.db is None:
            return hypergraph

        rows = await self.db.fetch(
            """
            SELECT p.course_id, p.hyperedge_id, p.logic, p.required_course
            FROM prerequisites p
            JOIN courses c ON c.id = p.course_id
            WHERE c.curriculum_id = $1
            """,
            curriculum_id,
        )
        grouped: Dict[Tuple[str, str, str], List[str]] = defaultdict(list)
        for row in rows:
            key = (str(row["course_id"]), str(row["hyperedge_id"]), str(row["logic"]))
            grouped[key].append(str(row["required_course"]))
        for (course_id, hedge_id, logic), required in grouped.items():
            hypergraph.add_edge(course_id, hedge_id, logic, required)
        return hypergraph
