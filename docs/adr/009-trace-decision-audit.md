# ADR-009: Trace != Decision != Audit

### Status
Accepted

### Context
Conflating observability traces, business decision events, and compliance audit records creates security risks, makes distributed tracing fragile, and bloats cryptographic ledgers.

### Decision
Decouple and explicitly define three distinct identifiers:
- `trace_id` (String): OpenTelemetry distributed tracing ID for profiling, request latency, and debug logs. Ephemeral (30-day retention).
- `decision_id` (UUID): Business transaction identifier representing an execution of the pathway recommendation pipeline.
- `audit_id` (UUID): Specific row in the immutable `audit_ledger`, containing cryptographic previous/current hashes, bundle reference, and tamper-evident proofs.

### Consequences
- A single `decision_id` links to one or more `audit_id` entries (e.g. initial AI proposal, human review approval) and carries a `trace_id` for observability.
- APM trace pruning does not affect legal audit trails.

### Verification
- `AuditRecord` and `PathwayResponse` data models enforce `trace_id`, `decision_id`, and `audit_event_ids`.
