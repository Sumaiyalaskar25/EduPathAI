# services/recognition/bitset_prerequisites.py
"""
Breakthrough #1: Bitset Prerequisite Reasoning Engine.
Replaces recursive CTEs / O(V+E) graph hops with O(V/64) bitwise operations.
"""
from __future__ import annotations

from typing import List, Dict, Set, Tuple


class BitsetHypergraph:
    """
    Stores prerequisite hypergraphs as 64-bit word bitsets.
    - AND requirements: and_mask[c] & ~completed == 0
    - OR requirements: any(all((group[w] & completed[w]) == group[w]) for group in or_masks[c])
    """

    def __init__(self, num_courses: int = 1024):
        self.num_courses = num_courses
        self.num_words = (num_courses + 63) // 64
        # Mapping from course string ID to integer index and vice versa
        self.course_to_idx: Dict[str, int] = {}
        self.idx_to_course: Dict[int, str] = {}
        self._next_idx: int = 0

        # Bitmask for direct/transitive AND requirements: [course_idx][word_idx]
        self.and_mask: List[List[int]] = [
            [0] * self.num_words for _ in range(num_courses)
        ]
        # List of OR groups per course: [course_idx] -> list of bitmask words
        self.or_masks: List[List[List[int]]] = [[] for _ in range(num_courses)]
        # Dependents lookup for delta updates: prereq_idx -> set of course_idxs
        self._dependents: Dict[int, Set[int]] = {}

    def get_or_create_idx(self, course_id: str) -> int:
        if course_id not in self.course_to_idx:
            idx = self._next_idx
            self._next_idx += 1
            self.course_to_idx[course_id] = idx
            self.idx_to_course[idx] = course_id
            return idx
        return self.course_to_idx[course_id]

    def add_and_prereqs(self, course_id: str, required_course_ids: List[str]) -> None:
        c_idx = self.get_or_create_idx(course_id)
        for req in required_course_ids:
            r_idx = self.get_or_create_idx(req)
            w = r_idx // 64
            b = r_idx % 64
            self.and_mask[c_idx][w] |= (1 << b)
            self._dependents.setdefault(r_idx, set()).add(c_idx)

    def add_or_prereq_group(self, course_id: str, group_course_ids: List[str]) -> None:
        c_idx = self.get_or_create_idx(course_id)
        mask = [0] * self.num_words
        for req in group_course_ids:
            r_idx = self.get_or_create_idx(req)
            w = r_idx // 64
            b = r_idx % 64
            mask[w] |= (1 << b)
            self._dependents.setdefault(r_idx, set()).add(c_idx)
        self.or_masks[c_idx].append(mask)

    def create_completed_mask(self, completed_ids: Set[str]) -> List[int]:
        mask = [0] * self.num_words
        for cid in completed_ids:
            if cid in self.course_to_idx:
                idx = self.course_to_idx[cid]
                mask[idx // 64] |= (1 << (idx % 64))
        return mask

    def set_completed(self, completed_mask: List[int], course_id: str) -> None:
        if course_id in self.course_to_idx:
            idx = self.course_to_idx[course_id]
            completed_mask[idx // 64] |= (1 << (idx % 64))

    def is_unlocked(self, course_idx: int, completed_mask: List[int]) -> bool:
        """O(W) check where W = num_words (16 words for 1000 courses)."""
        # 1. Check AND requirements
        and_req = self.and_mask[course_idx]
        for w in range(self.num_words):
            if (and_req[w] & ~completed_mask[w]) != 0:
                return False  # Missing a required AND prerequisite

        # 2. Check OR requirements if present
        if self.or_masks[course_idx]:
            for or_group in self.or_masks[course_idx]:
                # If all bits in or_group are satisfied by completed
                if all((or_group[w] & completed_mask[w]) == or_group[w] for w in range(self.num_words)):
                    return True
            return False

        return True

    def compute_frontier(self, target_courses: List[str], completed_ids: Set[str]) -> List[str]:
        """O(V * W) = O(V^2 / 64) frontier calculation."""
        cm = self.create_completed_mask(completed_ids)
        frontier = []
        for cid in target_courses:
            if cid not in self.course_to_idx:
                frontier.append(cid)  # No prereqs recorded
                continue
            idx = self.course_to_idx[cid]
            if self.is_unlocked(idx, cm):
                frontier.append(cid)
        return frontier

    def delta_frontier(
        self,
        newly_completed_course: str,
        completed_mask: List[int],
        current_frontier: List[str]
    ) -> List[str]:
        """
        Incremental frontier evaluation: only evaluate dependents of newly completed course.
        O(affected * W) instead of O(V * W).
        """
        if newly_completed_course not in self.course_to_idx:
            return []

        new_idx = self.course_to_idx[newly_completed_course]
        self.set_completed(completed_mask, newly_completed_course)

        newly_unlocked = []
        affected = self._dependents.get(new_idx, set())
        for c_idx in affected:
            cid = self.idx_to_course[c_idx]
            if cid not in current_frontier and self.is_unlocked(c_idx, completed_mask):
                newly_unlocked.append(cid)

        return newly_unlocked
