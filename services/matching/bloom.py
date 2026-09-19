# services/matching/bloom.py
"""
Bloom's taxonomy comparison.

Levels (revised Anderson & Krathwohl, 2001):
  1 = remember
  2 = understand
  3 = apply
  4 = analyze
  5 = evaluate
  6 = create

A source outcome SATISFIES a target outcome's Bloom level if
source_level >= target_level. The reverse is a gap.

Owner: Member 2
"""
from __future__ import annotations

BLOOM_LEVELS: dict[int, str] = {
    1: "remember",
    2: "understand",
    3: "apply",
    4: "analyze",
    5: "evaluate",
    6: "create",
}

BLOOM_KEYWORDS: dict[str, int] = {
    # level 1
    "remember": 1, "recall": 1, "list": 1, "identify": 1, "define": 1,
    "recognize": 1, "name": 1, "state": 1,
    # level 2
    "understand": 2, "explain": 2, "describe": 2, "summarize": 2,
    "interpret": 2, "classify": 2, "paraphrase": 2, "discuss": 2,
    # level 3
    "apply": 3, "implement": 3, "use": 3, "solve": 3, "demonstrate": 3,
    "compute": 3, "execute": 3, "calculate": 3,
    # level 4
    "analyze": 4, "analyse": 4, "compare": 4, "differentiate": 4,
    "organize": 4, "examine": 4, "investigate": 4,
    # level 5
    "evaluate": 5, "assess": 5, "critique": 5, "judge": 5, "justify": 5,
    "appraise": 5, "argue": 5,
    # level 6
    "create": 6, "design": 6, "construct": 6, "develop": 6, "formulate": 6,
    "produce": 6, "invent": 6, "compose": 6,
}


def bloom_satisfies(source_level: int, target_level: int) -> bool:
    """Return True if source cognitive level meets or exceeds target."""
    _validate_level(source_level)
    _validate_level(target_level)
    return source_level >= target_level


def bloom_gap(source_levels: list[int], target_levels: list[int]) -> float:
    """
    Fraction of target levels covered by at least one source level.

    Returns 1.0 if all target levels are satisfied, 0.0 if none are.
    Returns 1.0 if target_levels is empty (vacuously satisfied).
    """
    if not target_levels:
        return 1.0
    for lv in source_levels:
        _validate_level(lv)
    for lv in target_levels:
        _validate_level(lv)

    covered = sum(
        1 for t in target_levels
        if any(bloom_satisfies(s, t) for s in source_levels)
    )
    return covered / len(target_levels)


def parse_bloom(text: str) -> int:
    """
    Map an English verb (or short phrase) to a Bloom level 1-6.

    Case-insensitive. Returns 0 if no keyword matches (caller decides
    whether to treat 0 as 'unknown' or fall back to a default).
    """
    if not isinstance(text, str) or not text.strip():
        return 0
    lowered = text.lower()
    best_level = 0
    for keyword, level in BLOOM_KEYWORDS.items():
        # match whole word
        if keyword in lowered.split() or lowered.startswith(keyword + " "):
            best_level = max(best_level, level)
    return best_level


def bloom_level_name(level: int) -> str:
    """Return the human-readable name for a Bloom level."""
    _validate_level(level)
    return BLOOM_LEVELS[level]


def _validate_level(level: int) -> None:
    if level not in BLOOM_LEVELS:
        raise ValueError(
            f"Bloom level must be in 1-6, got {level!r}"
        )
