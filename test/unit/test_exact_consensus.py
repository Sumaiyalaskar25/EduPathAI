from services.matching.consensus import exact_model_vote, decision_agreement, consensus_decision
from services.schemas import RecognitionStatus, MatchResult


def test_exact_model_vote_unanimous():
    votes = [RecognitionStatus.DIRECT, RecognitionStatus.DIRECT, RecognitionStatus.DIRECT]
    assert exact_model_vote(votes) == RecognitionStatus.DIRECT


def test_exact_model_vote_majority():
    votes = [RecognitionStatus.DIRECT, RecognitionStatus.BRIDGE, RecognitionStatus.DIRECT]
    assert exact_model_vote(votes) == RecognitionStatus.DIRECT


def test_exact_model_vote_divergence():
    # 3-way split -> REVIEW
    votes = [RecognitionStatus.DIRECT, RecognitionStatus.BRIDGE, RecognitionStatus.MISSING]
    assert exact_model_vote(votes) == RecognitionStatus.REVIEW


def test_consensus_decision_degradation():
    m1 = [
        MatchResult("A", "X", 0.95, 0.95, True, 1.0, True, True, True, 0.9),
    ]
    m2 = [
        MatchResult("A", "X", 0.50, 0.50, True, 1.0, True, True, True, 0.8),
    ]
    # Model 1 -> DIRECT, Model 2 -> MISSING (agreement = 0.0)
    res = consensus_decision([m1, m2], policy={}, agreement_threshold=0.85)
    assert res is None  # Signals degradation to human review
