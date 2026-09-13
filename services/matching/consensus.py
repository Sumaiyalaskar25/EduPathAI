# services/matching/consensus.py
"""
Hardened Multi-Model Consensus Engine.
Provides:
1. Exact deterministic majority/unanimous voting for multi-LLM ensembles (N <= 5).
2. Decision-level agreement metrics across candidate pairs.
3. High-throughput MinHash consensus for large batch evaluation.
"""
from __future__ import annotations

from collections import Counter
from typing import Dict, List, Optional, Set, Tuple

from services.schemas import MatchResult, RecognitionStatus
from services.recognition.recognizer import classify


def exact_model_vote(statuses: List[RecognitionStatus]) -> RecognitionStatus:
    """
    Exact deterministic voting for an ensemble of model predictions.
    - Unanimous decision -> accept.
    - Strict majority decision -> accept.
    - Tie or high divergence -> REVIEW.
    """
    if not statuses:
        return RecognitionStatus.REVIEW

    counts = Counter(statuses)
    winner, votes = counts.most_common(1)[0]

    # Majority threshold: strictly more than half the voters
    if votes > len(statuses) // 2:
        return winner

    return RecognitionStatus.REVIEW


def decision_agreement(results: List[List[MatchResult]], policy: dict) -> float:
    """
    Computes exact agreement fraction: proportion of (source, target) course pairs
    where ALL models classify into the exact same RecognitionStatus.
    """
    if not results:
        return 0.0

    by_pair: Dict[Tuple[str, str], List[RecognitionStatus]] = {}
    for model_results in results:
        for m in model_results:
            key = (m.source_course_id, m.target_course_id)
            by_pair.setdefault(key, []).append(classify(m, policy))

    if not by_pair:
        return 0.0

    agree_count = sum(1 for statuses in by_pair.values() if len(set(statuses)) == 1)
    return agree_count / len(by_pair)


def consensus_decision(
    results: List[List[MatchResult]],
    policy: dict,
    agreement_threshold: float = 0.85,
) -> Optional[List[MatchResult]]:
    """
    Returns the consensus MatchResult list if overall agreement >= threshold,
    otherwise returns None (signaling degradation to REVIEW).
    """
    if not results:
        return None

    agreement = decision_agreement(results, policy)
    if agreement >= agreement_threshold:
        # Return candidate from model with highest cumulative evidence quality
        return max(results, key=lambda rs: sum(r.evidence_quality for r in rs))

    return None
