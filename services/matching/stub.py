# services/matching/stub.py
"""Stub matcher. Returns structured MatchResult from fixtures."""
from __future__ import annotations

import json
from pathlib import Path
from services.schemas import MatchResult, EvidenceRef, DecisionBundle


class StubMatcher:
    """Returns fixture-based matches. Replaced by real matcher in Hour 12–14."""

    def __init__(self, fixtures_dir: Path = Path("test/fixtures")):
        self.fixtures_dir = fixtures_dir
        self._cache: dict[str, list[MatchResult]] = {}

    async def match(self, student_id: str, target_programme: str, bundle: DecisionBundle) -> list[MatchResult]:
        if target_programme in self._cache:
            return self._cache[target_programme]

        results: list[MatchResult] = []
        for fixture_dir in sorted(self.fixtures_dir.glob("fixture_*")):
            gold_file = fixture_dir / "gold.json"
            if not gold_file.exists():
                continue
            gold = json.loads(gold_file.read_text(encoding="utf-8"))
            expected = gold["expected"]
            results.append(MatchResult(
                source_course_id=gold["source_course"]["code"],
                target_course_id=gold["target_course"]["code"],
                semantic_score=expected.get("outcome_coverage_min", 0.5),
                outcome_coverage=expected.get("outcome_coverage_min", 0.5),
                prerequisite_status=expected.get("prerequisite_status", True),
                assessment_match=expected.get("assessment_match_max", 1.0),
                credit_compatibility=expected.get("credit_compatibility", True),
                domain_alignment=expected.get("domain_alignment", True),
                policy_eligibility=True,
                evidence_quality=0.9,
                evidence=[
                    EvidenceRef(
                        source_doc_id=f"{gold['fixture_id']}-src",
                        source_page="p.1",
                        target_doc_id=f"{gold['fixture_id']}-tgt",
                        target_page="p.1",
                        similarity=0.9,
                    )
                ],
                missing_outcomes=expected.get("missing_outcomes", []),
            ))
        self._cache[target_programme] = results
        return results
