from services.matching.consensus import decision_agreement, consensus_decision
from services.schemas import MatchResult


def m(src: str, tgt: str, coverage: float, domain: bool = True) -> MatchResult:
    return MatchResult(
        source_course_id=src,
        target_course_id=tgt,
        semantic_score=coverage,
        outcome_coverage=coverage,
        prerequisite_status=True,
        assessment_match=1.0,
        credit_compatibility=True,
        domain_alignment=domain,
        policy_eligibility=True,
        evidence_quality=0.9,
    )


def test_full_agreement():
    model_a = [m("A", "X", 0.95)]  # DIRECT
    model_b = [m("A", "X", 0.95)]  # DIRECT
    assert decision_agreement([model_a, model_b], {}) == 1.0
    res = consensus_decision([model_a, model_b], {}, 0.85)
    assert res is not None


def test_disagreement_on_semantics():
    model_a = [m("A", "X", 0.95)]  # DIRECT
    model_b = [m("A", "X", 0.70)]  # BRIDGE
    assert decision_agreement([model_a, model_b], {}) < 1.0
    res = consensus_decision([model_a, model_b], {}, 0.85)
    assert res is None  # Should degrade to REVIEW
