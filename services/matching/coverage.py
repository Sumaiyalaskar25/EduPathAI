# services/matching/coverage.py
"""
Outcome coverage computation.

Combines cross-encoder scores with Bloom taxonomy to determine whether
each target learning outcome is substantively covered by at least one
source learning outcome.

Owner: Member 2
"""
from __future__ import annotations

from services.matching.bloom import bloom_satisfies
from services.matching.cross_encoder import rerank


DEFAULT_CROSS_ENCODER_THRESHOLD = 0.70


def _bloom_ok(source_bloom: int, target_bloom: int) -> bool:
    """
    Return True if the source cognitive level meets the target's.

    If either level is 0 (unknown), we do NOT block on Bloom -
    treat as satisfied and let the caller decide.
    """
    if source_bloom == 0 or target_bloom == 0:
        return True
    return bloom_satisfies(source_bloom, target_bloom)


def compute_outcome_coverage(
    source_outcomes: list[dict],
    target_outcomes: list[dict],
    cross_encoder_threshold: float = DEFAULT_CROSS_ENCODER_THRESHOLD,
) -> tuple[float, list[str]]:
    """
    Compute the fraction of target outcomes covered by source outcomes.

    Args:
        source_outcomes: list of dicts with keys "text" and "bloom_level".
        target_outcomes: list of dicts with keys "text" and "bloom_level".
        cross_encoder_threshold: min cross-encoder score in [0,1].

    Returns:
        (coverage, missing_outcomes):
          - coverage: float in [0,1]. 1.0 if all targets covered.
          - missing_outcomes: list of target texts that are NOT covered.

    Edge cases:
        - Empty target list -> (1.0, []).
        - Empty source list with non-empty target -> (0.0, all target texts).
    """
    if not (0.0 <= cross_encoder_threshold <= 1.0):
        raise ValueError(
            f"cross_encoder_threshold must be in [0,1], got {cross_encoder_threshold}"
        )

    if not target_outcomes:
        return 1.0, []

    source_texts = [o["text"] for o in source_outcomes]
    source_blooms = [int(o.get("bloom_level", 0)) for o in source_outcomes]

    if not source_texts:
        return 0.0, [t["text"] for t in target_outcomes]

    covered = 0
    missing: list[str] = []

    for target in target_outcomes:
        target_text = target["text"]
        target_bloom = int(target.get("bloom_level", 0))

        # Score target against every source outcome
        scores = rerank(target_text, source_texts)

        matched = False
        for src_idx, score in enumerate(scores):
            if score >= cross_encoder_threshold:
                if _bloom_ok(source_blooms[src_idx], target_bloom):
                    matched = True
                    break

        if matched:
            covered += 1
        else:
            missing.append(target_text)

    return covered / len(target_outcomes), missing
