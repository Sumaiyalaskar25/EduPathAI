# services/matching/real.py
"""
Real matcher. Drop-in replacement for StubMatcher.

Reads fixtures via fixture_loader. Uses the real cross-encoder,
outcome coverage, Bloom, and domain sharding.

Same signature as StubMatcher:
    async def match(student_id, target_programme, bundle) -> list[MatchResult]

Field name is domain_alignment (matches services/schemas.py).

Owner: Member 2
"""
from __future__ import annotations

import logging
from pathlib import Path

from services.schemas import (
    DecisionBundle,
    EvidenceRef,
    MatchResult,
)
from services.matching.coverage import compute_outcome_coverage
from services.matching.cross_encoder import score_pair
from services.matching.domain_shard import (
    classify_domain,
    is_same_domain,
)
from services.matching.fixture_loader import (
    DEFAULT_FIXTURES_DIR,
    Fixture,
    load_all_fixtures,
)
from services.matching.version_provider import VersionProvider


log = logging.getLogger(__name__)


# Signal-level constants (tunable, captured in DecisionBundle)
CREDIT_TOLERANCE = 0.25
DEFAULT_EVIDENCE_QUALITY = 0.90
DEFAULT_RETRIEVAL_THRESHOLD = 0.70


class RealMatcher:
    """Structured matcher. Returns MatchResult with all 8 signals."""

    def __init__(
        self,
        fixtures_dir: Path = DEFAULT_FIXTURES_DIR,
        version_provider: VersionProvider | None = None,
    ) -> None:
        self.fixtures_dir = Path(fixtures_dir)
        self.version_provider = version_provider or VersionProvider()
        self._fixtures: list[Fixture] | None = None

    async def match(
        self,
        student_id: str,
        target_programme: str,
        bundle: DecisionBundle,
    ) -> list[MatchResult]:
        """
        Return one MatchResult per fixture.

        Same signature as StubMatcher - drop-in compatible.
        """
        fixtures = self._load_fixtures()
        results: list[MatchResult] = []
        for fx in fixtures:
            results.append(self._compute_match(fx, bundle))
        return results

    def _load_fixtures(self) -> list[Fixture]:
        if self._fixtures is None:
            self._fixtures = load_all_fixtures(self.fixtures_dir)
        return self._fixtures

    # ---------- per-fixture signal computation ----------

    def _compute_match(
        self,
        fx: Fixture,
        bundle: DecisionBundle,
    ) -> MatchResult:
        source_text = self._join_outcomes(fx.source.outcomes)
        target_text = self._join_outcomes(fx.target.outcomes)

        # 1. Semantic score: cross-encoder on joined texts
        semantic_score = score_pair(source_text, target_text)

        # 2. Outcome coverage + missing outcomes
        coverage, missing = compute_outcome_coverage(
            source_outcomes=fx.source.outcomes,
            target_outcomes=fx.target.outcomes,
            cross_encoder_threshold=bundle.retrieval_threshold
            if bundle is not None else DEFAULT_RETRIEVAL_THRESHOLD,
        )

        # 3. Prerequisite status (deferred: Member 1 hypergraph integration)
        prerequisite_status = True

        # 4. Assessment match
        assessment_match = self._assessment_match(fx)

        # 5. Credit compatibility
        credit_compatibility = self._credit_compatible(fx)

        # 6. Domain alignment
        source_domain = classify_domain(
            fx.source.name, [o["text"] for o in fx.source.outcomes]
        )
        target_domain = classify_domain(
            fx.target.name, [o["text"] for o in fx.target.outcomes]
        )
        domain_alignment = is_same_domain(source_domain, target_domain)

        # 7. Policy eligibility (deferred: Member 1 policy loader)
        policy_eligibility = True

        # 8. Evidence quality (provenance completeness)
        evidence_quality = DEFAULT_EVIDENCE_QUALITY

        # Evidence refs
        evidence = [
            EvidenceRef(
                source_doc_id=f"{fx.fixture_id}-source",
                source_page="syllabus",
                target_doc_id=f"{fx.fixture_id}-target",
                target_page="syllabus",
                similarity=semantic_score,
            )
        ]

        return MatchResult(
            source_course_id=fx.source.code,
            target_course_id=fx.target.code,
            semantic_score=semantic_score,
            outcome_coverage=coverage,
            prerequisite_status=prerequisite_status,
            assessment_match=assessment_match,
            credit_compatibility=credit_compatibility,
            domain_alignment=domain_alignment,
            policy_eligibility=policy_eligibility,
            evidence_quality=evidence_quality,
            evidence=evidence,
            missing_outcomes=missing,
        )

    # ---------- helpers ----------

    @staticmethod
    def _join_outcomes(outcomes: list[dict]) -> str:
        return " ".join(o["text"] for o in outcomes if o.get("text"))

    @staticmethod
    def _credit_compatible(fx: Fixture) -> bool:
        s = fx.source.credits
        t = fx.target.credits
        if s <= 0 or t <= 0:
            return True
        return abs(s - t) / t <= CREDIT_TOLERANCE

    @staticmethod
    def _assessment_match(fx: Fixture) -> float:
        s = fx.source.modality
        t = fx.target.modality
        if s == t:
            return 1.0
        # target demands lab but source is theory-only -> partial
        if "lab" in t and "lab" not in s:
            return 0.5
        # theory-only source vs theory+lab target (or vice versa)
        if "lab" in s or "lab" in t:
            return 0.8
        return 0.9
