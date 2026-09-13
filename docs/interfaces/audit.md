# Interface: Audit & Compliance

## Signature
```python
async def append(
    decision_id: UUID,
    bundle: DecisionBundle,
    input_hash: str,
    output_hash: str,
    confidence: float,
    evidence: list[EvidenceRef],
    ai_recommendation: str,
    trace_id: str,
    chain_id: str = "global",
) -> AuditRecord: ...

async def verify(chain_id: str = "global") -> None: ...
```

## Guarantees
- Serializable transaction isolation with chain-head row locking (`SELECT FOR UPDATE`).
- SHA-256 link validation: tampering with intermediate records throws `ValueError`.
- At-least-once outbox delivery with idempotent consumer tracking.
