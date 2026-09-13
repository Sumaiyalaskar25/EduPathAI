# services/solver/validator.py
"""
Independent Solution Validator for Academic Pathways.
The optimizer must never be the sole judge of its own output.

Operating law:
APPROXIMATE -> CANDIDATE
EXACT -> DECISION
VALIDATOR -> PROOF OF FEASIBILITY
AUDIT -> PROOF OF HISTORY
REVIEW -> SAFE FAILURE
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Set, Optional

from services.schemas import Pathway, TermPlan, PathwayMode, RecognitionStatus
from services.recognition.prerequisites import PrereqHypergraph


@dataclass
class ValidationReport:
    is_valid: bool
    errors: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)


class PathwayValidator:
    """
    Independently verifies that a proposed academic pathway satisfies
    all hard constraints before the pathway is returned to the student or logged to audit.
    """

    def __init__(
        self,
        min_credits_per_term: float = 12.0,
        max_credits_per_term: float = 24.0,
        max_total_terms: int = 12,
    ):
        self.min_credits_per_term = min_credits_per_term
        self.max_credits_per_term = max_credits_per_term
        self.max_total_terms = max_total_terms

    def validate_pathway(
        self,
        pathway: Pathway,
        required_target_courses: Set[str],
        initially_completed_courses: Set[str],
        hypergraph: PrereqHypergraph,
        course_credits_map: Dict[str, float],
    ) -> ValidationReport:
        errors: List[str] = []
        warnings: List[str] = []

        # 1. Check max total terms
        if pathway.terms > self.max_total_terms or len(pathway.terms_plan) > self.max_total_terms:
            errors.append(f"Pathway exceeds maximum allowable terms ({pathway.terms} > {self.max_total_terms})")

        completed_so_far = set(initially_completed_courses)
        seen_courses: Set[str] = set()

        for tp in pathway.terms_plan:
            term_credits = 0.0

            # 2. Check course prerequisites and duplicate scheduling
            for course_id in tp.courses:
                # Check duplicates
                if course_id in seen_courses:
                    errors.append(f"Course {course_id} scheduled multiple times in pathway")
                if course_id in initially_completed_courses:
                    warnings.append(f"Course {course_id} was already completed before matriculation")

                seen_courses.add(course_id)

                # Check prerequisite satisfaction from PREVIOUS terms
                if not hypergraph.is_unlocked(course_id, completed_so_far):
                    errors.append(f"Prerequisite unsatisfied for course {course_id} in Term {tp.term_number}")

                # Accumulate credits
                cr = course_credits_map.get(course_id, 4.0)
                term_credits += cr

            # 3. Check term credit workload constraints
            if tp.courses:
                if term_credits > self.max_credits_per_term:
                    errors.append(
                        f"Term {tp.term_number} credits ({term_credits:.1f}) exceed maximum ({self.max_credits_per_term:.1f})"
                    )
                if term_credits < self.min_credits_per_term and tp.term_number < len(pathway.terms_plan):
                    warnings.append(
                        f"Term {tp.term_number} credits ({term_credits:.1f}) below standard minimum ({self.min_credits_per_term:.1f})"
                    )

            # Update completed set for subsequent terms
            completed_so_far.update(tp.courses)

        # 4. Check graduation completeness: all required target courses must be scheduled or recognized
        missing_requirements = (required_target_courses - completed_so_far)
        if missing_requirements:
            errors.append(f"Pathway does not complete all degree requirements. Missing: {sorted(missing_requirements)}")

        return ValidationReport(
            is_valid=(len(errors) == 0),
            errors=errors,
            warnings=warnings,
        )
