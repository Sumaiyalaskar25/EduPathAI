# ADR-005: Human Validation Gate

### Status
Accepted

### Context
Automated syllabus parsers and extraction pipelines can parse incorrect credits, misread prerequisite tables, or miss appendix notes.

### Decision
Curriculum graphs and equivalence mappings are never used in production decision loops until an academic authority validates them. The graph builder and runtime pipeline consume only `curricula` records where `validated_at` and `validated_by` are set. Unvalidated curricula are marked draft and blocked from official recognition decisions.

### Consequences
- Human accountability is maintained at data ingestion time.
- Prevents garbage-in garbage-out cascading failures across downstream pathways.

### Verification
- SQL schema enforcement (`validated_at TIMESTAMPTZ NOT NULL`) and pipeline integrity checks.
