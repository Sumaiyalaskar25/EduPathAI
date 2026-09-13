import asyncio
import pytest
from uuid import uuid4
from datetime import datetime, timezone

from services.audit.ledger import Ledger
from services.schemas import DecisionBundle, EvidenceRef


def make_bundle() -> DecisionBundle:
    return DecisionBundle(
        id=uuid4(),
        curriculum_version="v1", policy_version="v1",
        model_version="m1", prompt_version="p1",
        embedding_model_version="e1", cross_encoder_version="c1",
        retrieval_threshold=0.7, solver_version="s1",
        solver_parameters_hash="h1", resource_catalog_version="r1",
        ontology_version="o1", ruleset_commit="git1",
        tool_definitions_hash="t1",
        captured_at=datetime.now(timezone.utc),
    )


@pytest.mark.asyncio
async def test_append_and_verify():
    ledger = Ledger()
    bundle = make_bundle()
    for i in range(5):
        await ledger.append(
            decision_id=uuid4(), bundle=bundle,
            input_hash=f"i{i}", output_hash=f"o{i}",
            confidence=0.9,
            evidence=[EvidenceRef("s", "1", "t", "1", 0.9)],
            ai_recommendation="DIRECT", trace_id=f"t{i}",
            chain_id="IIT-Bombay",
        )
    await ledger.verify("IIT-Bombay")


@pytest.mark.asyncio
async def test_concurrent_appends_no_race():
    """5 concurrent appends must all succeed with valid chain."""
    ledger = Ledger()
    bundle = make_bundle()

    async def one(i):
        await ledger.append(
            decision_id=uuid4(), bundle=bundle,
            input_hash=f"i{i}", output_hash=f"o{i}",
            confidence=0.9,
            evidence=[],
            ai_recommendation="DIRECT", trace_id=f"t{i}",
            chain_id="global",
        )

    await asyncio.gather(*[one(i) for i in range(5)])
    await ledger.verify("global")


@pytest.mark.asyncio
async def test_tampering_detected():
    ledger = Ledger()
    bundle = make_bundle()
    rec = await ledger.append(
        decision_id=uuid4(), bundle=bundle,
        input_hash="i", output_hash="o", confidence=0.9,
        evidence=[], ai_recommendation="DIRECT", trace_id="t",
        chain_id="global",
    )
    # Tamper with recorded value
    rec.ai_recommendation = "BRIDGE"
    with pytest.raises(ValueError, match="hash mismatch"):
        await ledger.verify("global")
