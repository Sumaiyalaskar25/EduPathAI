# services/matching/fixture_loader.py
"""
Fixture loader.

Reads existing gold.json fixtures (owned by Member 1) and enriches them
IN MEMORY with bloom_level and domain per outcome, so the RealMatcher can
consume them without modifying the original JSON files.

Owner: Member 2
"""
from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

from services.matching.bloom import parse_bloom
from services.matching.domain_shard import classify_domain


DEFAULT_FIXTURES_DIR = Path("test/fixtures")


@dataclass(frozen=True)
class FixtureCourse:
    code: str
    name: str
    credits: float
    modality: str
    outcomes: list[dict]  # [{"text": str, "bloom_level": int, "domain": str}, ...]


@dataclass(frozen=True)
class Fixture:
    fixture_id: str
    description: str
    source: FixtureCourse
    target: FixtureCourse
    expected: dict


def _enrich_outcome(text: str, course_name: str) -> dict:
    """Convert a plain outcome string into a structured dict."""
    return {
        "text": text,
        "bloom_level": parse_bloom(text),
        "domain": classify_domain(course_name, [text]).value,
    }


def _parse_course(raw: dict) -> FixtureCourse:
    code = raw.get("code", "")
    name = raw.get("name", "")
    try:
        credits = float(raw.get("credits", 0.0) or 0.0)
    except (TypeError, ValueError):
        credits = 0.0
    modality = raw.get("modality", "theory")
    outcomes_raw = raw.get("outcomes", []) or []
    outcomes = [
        _enrich_outcome(t, name)
        for t in outcomes_raw
        if isinstance(t, str) and t.strip()
    ]
    return FixtureCourse(
        code=code,
        name=name,
        credits=credits,
        modality=modality,
        outcomes=outcomes,
    )


def load_fixture(fixture_dir: Path) -> Fixture:
    """
    Load a single fixture from a directory containing gold.json.

    Raises:
        FileNotFoundError: if gold.json missing.
        ValueError: if gold.json missing required keys.
    """
    fixture_dir = Path(fixture_dir)
    gold_path = fixture_dir / "gold.json"
    if not gold_path.exists():
        raise FileNotFoundError(f"gold.json not found in {fixture_dir}")

    data = json.loads(gold_path.read_text(encoding="utf-8"))

    for key in ("fixture_id", "source_course", "target_course"):
        if key not in data:
            raise ValueError(f"gold.json missing required key: {key}")

    return Fixture(
        fixture_id=data["fixture_id"],
        description=data.get("description", ""),
        source=_parse_course(data["source_course"]),
        target=_parse_course(data["target_course"]),
        expected=data.get("expected", {}),
    )


def load_all_fixtures(fixtures_dir: Path = DEFAULT_FIXTURES_DIR) -> list[Fixture]:
    """
    Load every fixture_* subdirectory that contains a gold.json.
    Sorted by directory name for deterministic ordering.
    """
    fixtures_dir = Path(fixtures_dir)
    if not fixtures_dir.exists():
        return []

    fixtures: list[Fixture] = []
    for d in sorted(fixtures_dir.glob("fixture_*")):
        if d.is_dir() and (d / "gold.json").exists():
            fixtures.append(load_fixture(d))
    return fixtures
