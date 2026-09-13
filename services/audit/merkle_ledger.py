# services/audit/merkle_ledger.py
"""
Breakthrough #4: Merkle Tree Audit Ledger.
Replaces global serialization bottleneck with multi-shard sub-chains and O(log N) Merkle proofs.
"""
from __future__ import annotations

import hashlib
import json
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from typing import Dict, List, Optional
from uuid import UUID, uuid4

from services.schemas import AuditRecord, DecisionBundle, EvidenceRef


@dataclass
class MerkleProof:
    leaf_hash: str
    root_hash: str
    audit_path: List[tuple[str, str]]  # [(sibling_hash, 'left'|'right')]

    def verify(self) -> bool:
        current = self.leaf_hash
        for sibling, direction in self.audit_path:
            if direction == "left":
                combined = (sibling + current).encode("utf-8")
            else:
                combined = (current + sibling).encode("utf-8")
            current = hashlib.sha256(combined).hexdigest()
        return current == self.root_hash


class MerkleAuditLedger:
    def __init__(self, num_shards: int = 8):
        self.num_shards = num_shards
        # Shard -> list of AuditRecords
        self.shards: Dict[int, List[AuditRecord]] = {i: [] for i in range(num_shards)}
        self.shard_heads: Dict[int, str] = {i: "GENESIS" for i in range(num_shards)}
        self.by_id: Dict[UUID, AuditRecord] = {}

    def _hash_record(self, prev_hash: str, rec: AuditRecord) -> str:
        d = asdict(rec)
        d["evidence"] = [asdict(e) for e in rec.evidence]
        d.pop("current_hash", None)
        canonical = json.dumps(d, sort_keys=True, default=str)
        return hashlib.sha256((prev_hash + canonical).encode("utf-8")).hexdigest()

    def append(
        self,
        decision_id: UUID,
        bundle: DecisionBundle,
        input_hash: str,
        output_hash: str,
        confidence: float,
        evidence: List[EvidenceRef],
        ai_recommendation: str,
        trace_id: str,
    ) -> AuditRecord:
        """Appends record to an independent shard concurrently."""
        shard_id = int(decision_id.int) % self.num_shards
        prev_hash = self.shard_heads[shard_id]

        rec_id = uuid4()
        timestamp = datetime.now(timezone.utc)
        rec = AuditRecord(
            id=rec_id,
            recommendation_id=uuid4(),
            decision_id=decision_id,
            previous_hash=prev_hash,
            current_hash="",
            chain_id=f"shard-{shard_id}",
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

        current_hash = self._hash_record(prev_hash, rec)
        rec.current_hash = current_hash

        self.shards[shard_id].append(rec)
        self.shard_heads[shard_id] = current_hash
        self.by_id[rec_id] = rec
        return rec

    def get_merkle_root(self) -> str:
        """Combines all shard heads into a single Merkle Root."""
        hashes = [self.shard_heads[i] for i in range(self.num_shards)]
        return self._compute_merkle_root(hashes)

    def _compute_merkle_root(self, leaf_hashes: List[str]) -> str:
        if not leaf_hashes:
            return hashlib.sha256(b"EMPTY").hexdigest()
        current = leaf_hashes[:]
        while len(current) > 1:
            if len(current) % 2 == 1:
                current.append(current[-1])  # duplicate last if odd
            next_level = []
            for i in range(0, len(current), 2):
                combined = (current[i] + current[i + 1]).encode("utf-8")
                next_level.append(hashlib.sha256(combined).hexdigest())
            current = next_level
        return current[0]

    def get_proof(self, record_id: UUID) -> MerkleProof:
        """Generates O(log N) Merkle membership proof."""
        if record_id not in self.by_id:
            raise KeyError("Record not found")
        rec = self.by_id[record_id]
        shard_id = int(rec.decision_id.int) % self.num_shards

        # Generate tree over current shard leaves
        leaves = [r.current_hash for r in self.shards[shard_id]]
        leaf_idx = [i for i, r in enumerate(self.shards[shard_id]) if r.id == record_id][0]

        # Pad to power of 2
        padded = leaves[:]
        while len(padded) & (len(padded) - 1) != 0 or len(padded) < 2:
            padded.append(padded[-1])

        audit_path: List[tuple[str, str]] = []
        idx = leaf_idx
        current_layer = padded

        while len(current_layer) > 1:
            if idx % 2 == 0:
                sibling = current_layer[idx + 1]
                audit_path.append((sibling, "right"))
            else:
                sibling = current_layer[idx - 1]
                audit_path.append((sibling, "left"))

            next_layer = []
            for i in range(0, len(current_layer), 2):
                combined = (current_layer[i] + current_layer[i + 1]).encode("utf-8")
                next_layer.append(hashlib.sha256(combined).hexdigest())
            idx //= 2
            current_layer = next_layer

        root = current_layer[0]
        return MerkleProof(
            leaf_hash=rec.current_hash,
            root_hash=root,
            audit_path=audit_path,
        )
