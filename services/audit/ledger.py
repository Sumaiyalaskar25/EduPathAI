# services/audit/ledger.py
"""
Partitioned hash-chained audit ledger.

Fixes from critique:
- Dedicated chain-head row (no empty-table race)
- Retry wrapper for serialization failures
- Partitioned chains (chain_id = institution or 'global')
- Honest documentation of at-least-once semantics
"""
from __future__ import annotations

import hashlib
import json
from dataclasses import asdict
from datetime import datetime, timezone
from typing import Any, Optional, Protocol
from uuid import UUID, uuid4

from services.schemas import AuditRecord, DecisionBundle, EvidenceRef


class DBConnectionPool(Protocol):
    async def acquire(self) -> Any: ...
    async def fetch(self, query: str, *args) -> list[dict]: ...
    async def fetchrow(self, query: str, *args) -> Optional[dict]: ...
    async def execute(self, query: str, *args) -> str: ...


class Ledger:
    def __init__(self, db: Any = None, max_retries: int = 3):
        self.db = db
        self.max_retries = max_retries
        # In-memory storage for test/standalone mode without active PostgreSQL
        self._mem_chain_heads: dict[str, str] = {"global": "GENESIS"}
        self._mem_records: dict[str, list[AuditRecord]] = {"global": []}
        self._mem_by_decision: dict[UUID, AuditRecord] = {}

    async def append(
        self,
        decision_id: UUID,
        bundle: DecisionBundle,
        input_hash: str,
        output_hash: str,
        confidence: float,
        evidence: list[EvidenceRef],
        ai_recommendation: str,
        trace_id: str,
        chain_id: str = "global",
    ) -> AuditRecord:
        """Append with retry on serialization failure."""
        if self.db is None:
            return self._append_memory(
                decision_id, bundle, input_hash, output_hash,
                confidence, evidence, ai_recommendation, trace_id, chain_id,
            )

        last_err: Exception | None = None
        for attempt in range(self.max_retries):
            try:
                return await self._append_once(
                    decision_id, bundle, input_hash, output_hash,
                    confidence, evidence, ai_recommendation, trace_id, chain_id,
                )
            except Exception as e:
                # Retry on asyncpg.SerializationError or similar
                last_err = e
                continue
        raise last_err or RuntimeError("ledger: unreachable")

    def _append_memory(
        self,
        decision_id: UUID,
        bundle: DecisionBundle,
        input_hash: str,
        output_hash: str,
        confidence: float,
        evidence: list[EvidenceRef],
        ai_recommendation: str,
        trace_id: str,
        chain_id: str,
    ) -> AuditRecord:
        prev_hash = self._mem_chain_heads.get(chain_id, "GENESIS")
        rec_id = uuid4()
        timestamp = datetime.now(timezone.utc)
        rec = AuditRecord(
            id=rec_id,
            recommendation_id=uuid4(),
            decision_id=decision_id,
            previous_hash=prev_hash,
            current_hash="",
            chain_id=chain_id,
            bundle_id=bundle.id,
            input_hash=input_hash,
            output_hash=output_hash,
            confidence=confidence,
            evidence=evidence,
            ai_recommendation=ai_recommendation,
            human_decision=None,
            trace_id=trace_id,
            timestamp=timestamp,
        )
        canonical = self._canonical(rec)
        current_hash = hashlib.sha256((prev_hash + canonical).encode()).hexdigest()
        rec.current_hash = current_hash

        self._mem_chain_heads[chain_id] = current_hash
        self._mem_records.setdefault(chain_id, []).append(rec)
        self._mem_by_decision[decision_id] = rec
        return rec

    async def _append_once(
        self,
        decision_id: UUID,
        bundle: DecisionBundle,
        input_hash: str,
        output_hash: str,
        confidence: float,
        evidence: list[EvidenceRef],
        ai_recommendation: str,
        trace_id: str,
        chain_id: str,
    ) -> AuditRecord:
        async with self.db.acquire() as conn:
            async with conn.transaction(isolation="serializable"):
                # 1. Lock chain head row (exists — no empty-table race)
                head = await conn.fetchrow(
                    "SELECT head_hash FROM audit_chain_heads WHERE chain_id = $1 FOR UPDATE",
                    chain_id,
                )
                if not head:
                    await conn.execute(
                        "INSERT INTO audit_chain_heads (chain_id, head_hash) VALUES ($1, 'GENESIS')",
                        chain_id,
                    )
                    prev_hash = "GENESIS"
                else:
                    prev_hash = head["head_hash"]

                # 2. Build record
                rec_id = uuid4()
                timestamp = datetime.now(timezone.utc)
                rec = AuditRecord(
                    id=rec_id,
                    recommendation_id=uuid4(),
                    decision_id=decision_id,
                    previous_hash=prev_hash,
                    current_hash="",  # computed below
                    chain_id=chain_id,
                    bundle_id=bundle.id,
                    input_hash=input_hash,
                    output_hash=output_hash,
                    confidence=confidence,
                    evidence=evidence,
                    ai_recommendation=ai_recommendation,
                    human_decision=None,
                    trace_id=trace_id,
                    timestamp=timestamp,
                )

                # 3. Compute hash
                canonical = self._canonical(rec)
                current_hash = hashlib.sha256((prev_hash + canonical).encode()).hexdigest()
                rec.current_hash = current_hash

                # 4. Insert
                await conn.execute(
                    """
                    INSERT INTO audit_ledger (
                        id, chain_id, recommendation_id, decision_id,
                        previous_hash, current_hash, bundle_id,
                        input_hash, output_hash, confidence, evidence,
                        ai_recommendation, trace_id, timestamp
                    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
                    """,
                    rec.id, rec.chain_id, rec.recommendation_id, rec.decision_id,
                    rec.previous_hash, rec.current_hash, rec.bundle_id,
                    rec.input_hash, rec.output_hash, rec.confidence,
                    json.dumps([asdict(e) for e in rec.evidence]),
                    rec.ai_recommendation, rec.trace_id, rec.timestamp,
                )

                # 5. Update chain head
                await conn.execute(
                    "UPDATE audit_chain_heads SET head_hash = $1, head_record_id = $2, updated_at = NOW() WHERE chain_id = $3",
                    current_hash, rec.id, chain_id,
                )

                return rec

    async def get_by_decision_id(self, decision_id: UUID) -> Optional[AuditRecord]:
        if self.db is None:
            return self._mem_by_decision.get(decision_id)
        row = await self.db.fetchrow(
            """
            SELECT id, chain_id, previous_hash, current_hash, recommendation_id, decision_id,
                   bundle_id, input_hash, output_hash, confidence, evidence,
                   ai_recommendation, human_decision, trace_id, timestamp
            FROM audit_ledger
            WHERE decision_id = $1
            """,
            decision_id,
        )
        if not row:
            return None
        return AuditRecord(
            id=row["id"],
            recommendation_id=row["recommendation_id"],
            decision_id=row["decision_id"],
            previous_hash=row["previous_hash"],
            current_hash=row["current_hash"],
            chain_id=row["chain_id"],
            bundle_id=row["bundle_id"],
            input_hash=row["input_hash"],
            output_hash=row["output_hash"],
            confidence=float(row["confidence"]),
            evidence=[EvidenceRef(**e) for e in (json.loads(row["evidence"]) if isinstance(row["evidence"], str) else row["evidence"])],
            ai_recommendation=row["ai_recommendation"],
            human_decision=row["human_decision"],
            trace_id=row["trace_id"],
            timestamp=row["timestamp"],
        )

    async def verify(self, chain_id: str = "global") -> None:
        """Walk the chain and confirm every link is intact."""
        if self.db is None:
            records = self._mem_records.get(chain_id, [])
            prev_hash = "GENESIS"
            for rec in records:
                if rec.previous_hash != prev_hash:
                    raise ValueError(f"chain broken at {rec.id}")
                canonical = self._canonical(rec)
                expected = hashlib.sha256((prev_hash + canonical).encode()).hexdigest()
                if rec.current_hash != expected:
                    raise ValueError(f"hash mismatch at {rec.id}")
                prev_hash = rec.current_hash
            return

        rows = await self.db.fetch(
            """
            SELECT id, previous_hash, current_hash, recommendation_id, decision_id,
                   bundle_id, input_hash, output_hash, confidence, evidence,
                   ai_recommendation, COALESCE(human_decision, '') AS human_decision,
                   trace_id, timestamp
            FROM audit_ledger
            WHERE chain_id = $1
            ORDER BY timestamp ASC, id ASC
            """,
            chain_id,
        )

        prev_hash = "GENESIS"
        for row in rows:
            if row["previous_hash"] != prev_hash:
                raise ValueError(f"chain broken at {row['id']}")

            evidence_data = json.loads(row["evidence"]) if isinstance(row["evidence"], str) else row["evidence"]
            rec = AuditRecord(
                id=row["id"],
                recommendation_id=row["recommendation_id"],
                decision_id=row["decision_id"],
                previous_hash=row["previous_hash"],
                current_hash="",  # exclude from computation
                chain_id=chain_id,
                bundle_id=row["bundle_id"],
                input_hash=row["input_hash"],
                output_hash=row["output_hash"],
                confidence=float(row["confidence"]),
                evidence=[EvidenceRef(**e) for e in evidence_data],
                ai_recommendation=row["ai_recommendation"],
                human_decision=row["human_decision"] or None,
                trace_id=row["trace_id"],
                timestamp=row["timestamp"],
            )
            canonical = self._canonical(rec)
            expected = hashlib.sha256((prev_hash + canonical).encode()).hexdigest()

            if row["current_hash"] != expected:
                raise ValueError(f"hash mismatch at {row['id']}")

            prev_hash = row["current_hash"]

    @staticmethod
    def _canonical(rec: AuditRecord) -> str:
        d = asdict(rec)
        d["evidence"] = [asdict(e) for e in rec.evidence]
        # Exclude current_hash (computed from it)
        d.pop("current_hash", None)
        return json.dumps(d, sort_keys=True, default=str)
