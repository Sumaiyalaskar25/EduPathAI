# services/recognition/recognizer.py
"""
Deterministic recognizer. NOT AI. NOT an LLM.
Takes structured MatchResult and produces RecognitionStatus.

This is where academic logic lives. AI provides scores; this file decides.
"""
from __future__ import annotations

from uuid import uuid4
from services.schemas import (
    MatchResult, RecognitionStatus, Gap, GapType,
)


# --- Configurable thresholds. MUST be calibrated with domain expert. ---
OUTCOME_COVERAGE_DIRECT = 0.90
OUTCOME_COVERAGE_BRIDGE = 0.60
SEMANTIC_DIRECT = 0.85
SEMANTIC_BRIDGE = 0.65
ASSESSMENT_DIRECT = 0.90
EVIDENCE_QUALITY_MIN = 0.70


def classify(match: MatchResult, policy: dict) -> RecognitionStatus:
    """
    Deterministic classification. Ordered checks, fail-fast.

    Order matters: policy gates first, then hard academic gates,
    then outcome coverage, then evidence quality.
    """
    # 1. Policy conflict — highest priority
    if not match.policy_eligibility:
        return RecognitionStatus.POLICY_CONFLICT

    # 2. Missing prerequisite — hard gate
    if not match.prerequisite_status:
        return RecognitionStatus.MISSING

    # 3. Domain mismatch — hard gate (cross-domain needs review)
    if not match.domain_alignment:
        return RecognitionStatus.REVIEW

    # 4. Credit incompatibility — hard gate
    if not match.credit_compatibility:
        return RecognitionStatus.REVIEW

    # 5. Evidence quality — hard gate
    if match.evidence_quality < EVIDENCE_QUALITY_MIN:
        return RecognitionStatus.REVIEW

    # 6. Direct recognition — ALL conditions must hold
    if (
        match.outcome_coverage >= OUTCOME_COVERAGE_DIRECT
        and match.semantic_score >= SEMANTIC_DIRECT
        and match.assessment_match >= ASSESSMENT_DIRECT
    ):
        return RecognitionStatus.DIRECT

    # 7. Bridge — partial coverage, can be remediated
    if (
        match.outcome_coverage >= OUTCOME_COVERAGE_BRIDGE
        or match.semantic_score >= SEMANTIC_BRIDGE
    ):
        return RecognitionStatus.BRIDGE

    # 8. Default: missing
    return RecognitionStatus.MISSING


def classify_gap(match: MatchResult, status: RecognitionStatus) -> Gap | None:
    """Deterministic gap classification."""
    if status == RecognitionStatus.DIRECT:
        return None

    # Assessment gap: knowledge present, evidence/lab missing
    if (
        match.outcome_coverage >= OUTCOME_COVERAGE_DIRECT
        and match.assessment_match < ASSESSMENT_DIRECT
    ):
        return Gap(
            gap_id=uuid4(),
            gap_type=GapType.ASSESSMENT,
            description=f"Assessment evidence insufficient for {match.target_course_id}",
            missing_outcomes=match.missing_outcomes,
        )

    # Prerequisite gap: hard gate failed
    if not match.prerequisite_status:
        return Gap(
            gap_id=uuid4(),
            gap_type=GapType.PREREQUISITE,
            description=f"Prerequisite not satisfied for {match.target_course_id}",
            missing_outcomes=match.missing_outcomes,
        )

    # Knowledge gap: partial outcome coverage
    return Gap(
        gap_id=uuid4(),
        gap_type=GapType.KNOWLEDGE,
        description=f"Partial coverage for {match.target_course_id}",
        missing_outcomes=match.missing_outcomes,
    )
