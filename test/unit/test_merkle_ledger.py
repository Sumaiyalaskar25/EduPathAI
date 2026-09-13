from datetime import datetime, timezone
from uuid import uuid4
from services.audit.merkle_ledger import MerkleAuditLedger
from services.schemas import DecisionBundle, EvidenceRef


def make_bundle() -> DecisionBundle:
    return DecisionBundle(
        id=uuid4(),
        curriculum_version="v1",
        policy_version="v1",
        model_version="m1",
        prompt_version="p1",
        embedding_model_version="e1",
        cross_encoder_version="c1",
        retrieval_threshold=0.7,
        solver_version="s1",
        solver_parameters_hash="h1",
        resource_catalog_version="r1",
        ontology_version="o1",
        ruleset_commit="git1",
        tool_definitions_hash="t1",
        captured_at=datetime.now(timezone.utc),
    )


def test_merkle_ledger_append_and_proof():
    ledger = MerkleAuditLedger(num_shards=4)
    bundle = make_bundle()

    records = []
    for i in range(8):
        rec = ledger.append(
            decision_id=uuid4(),
            bundle=bundle,
            input_hash=f"in_{i}",
            output_hash=f"out_{i}",
            confidence=0.9,
            evidence=[EvidenceRef("s", "1", "t", "1", 0.9)],
            ai_recommendation="DIRECT",
            trace_id=f"tr_{i}",
        )
        records.append(rec)

    root = ledger.get_merkle_root()
    assert len(root) == 64  # SHA-256 hex string

    # Verify O(log N) Merkle proof for each record
    for rec in records:
        proof = ledger.get_proof(rec.id)
        assert proof.verify()
