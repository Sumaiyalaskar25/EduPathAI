# ADR-003: Partitioned Hash-Chained Ledger

### Status
Accepted

### Context
A global linear blockchain/ledger in high-concurrency systems suffers serialization bottlenecks and lock contention. Furthermore, an empty-table race occurs when the first record attempts to read the non-existent previous head.

### Decision
1. Introduce `audit_chain_heads` table to anchor chain heads with explicit row-level locks (`SELECT ... FOR UPDATE`).
2. Partition audit chains by institution or scope (`chain_id`), enabling parallel appending across universities.
3. Use SHA-256 hash chaining `H(n) = SHA-256(prev_hash + canonical_json(record))`.
4. Provide a serializable transaction retry wrapper for handling contention gracefully.

### Consequences
- Eliminates global lock contention.
- Eliminates empty-table genesis race condition.
- Any manual database tampering breaks the hash chain verification (`ledger.verify(chain_id)`).

### Verification
- `test/unit/test_ledger.py` runs concurrent appends and verifies chain integrity and tamper detection.
