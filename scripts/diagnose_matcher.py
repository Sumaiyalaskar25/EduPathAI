"""
One-shot diagnostic. Runs RealMatcher against all fixtures using REAL
models (no monkeypatching) and prints every signal for every fixture.

Run: python scripts/diagnose_matcher.py

NOT a test. NOT committed as a deliverable. Delete after reading output.
"""
from __future__ import annotations

import asyncio
import sys
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from services.matching.real import RealMatcher
from services.schemas import DecisionBundle


def _make_bundle() -> DecisionBundle:
    return DecisionBundle(
        id=uuid4(),
        curriculum_version="diagnostic/v1",
        policy_version="diagnostic/v1",
        model_version="diagnostic",
        prompt_version="diagnostic",
        embedding_model_version="sentence-transformers/all-MiniLM-L6-v2",
        cross_encoder_version="cross-encoder/ms-marco-MiniLM-L-6-v2",
        retrieval_threshold=0.70,
        solver_version="diagnostic",
        solver_parameters_hash="hash",
        resource_catalog_version="diagnostic",
        ontology_version="diagnostic",
        ruleset_commit="abc",
        tool_definitions_hash="def",
        captured_at=datetime.now(timezone.utc),
    )


def _fmt(x) -> str:
    if isinstance(x, float):
        return f"{x:.4f}"
    return str(x)


async def main() -> None:
    matcher = RealMatcher(fixtures_dir=Path("test/fixtures"))
    bundle = _make_bundle()
    results = await matcher.match("diagnostic", "diagnostic", bundle)

    # Try to import the recognizer for status
    try:
        from services.recognition.recognizer import classify
        have_recognizer = True
    except Exception:
        have_recognizer = False

    for r in results:
        print("=" * 72)
        print(f"source={r.source_course_id}  ->  target={r.target_course_id}")
        print("-" * 72)
        print(f"  semantic_score          = {_fmt(r.semantic_score)}")
        print(f"  outcome_coverage        = {_fmt(r.outcome_coverage)}")
        print(f"  prerequisite_status     = {r.prerequisite_status}")
        print(f"  assessment_match        = {_fmt(r.assessment_match)}")
        print(f"  credit_compatibility    = {r.credit_compatibility}")
        print(f"  domain_alignment        = {r.domain_alignment}")
        print(f"  policy_eligibility      = {r.policy_eligibility}")
        print(f"  evidence_quality        = {_fmt(r.evidence_quality)}")
        print(f"  missing_outcomes ({len(r.missing_outcomes)}):")
        for mo in r.missing_outcomes:
            print(f"      - {mo}")
        if have_recognizer:
            try:
                status = classify(r, {})
                print(f"  RECOGNIZER STATUS       = {status.value}")
            except Exception as e:
                print(f"  RECOGNIZER STATUS       = <error: {e}>")
        print()

    print("=" * 72)
    print("SUMMARY")
    print("=" * 72)
    for r in results:
        line = (
            f"{r.source_course_id:>10} -> {r.target_course_id:<10} "
            f"cov={_fmt(r.outcome_coverage)}  sem={_fmt(r.semantic_score)}  "
            f"missing={len(r.missing_outcomes)}"
        )
        print(line)


if __name__ == "__main__":
    asyncio.run(main())
