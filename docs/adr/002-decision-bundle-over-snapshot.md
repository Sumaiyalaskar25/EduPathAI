# ADR-002: Decision Bundle over Snapshot

### Status
Accepted

### Context
Academic decisions must be 100% reproducible for regulatory audits, appeals, and court challenges years later. Previous systems captured only high-level versions (curriculum, policy), omitting embedding model versions, cross-encoders, solver parameters, and retrieval cutoffs.

### Decision
Replace naive database state snapshots with an immutable, 13-field `DecisionBundle`:
1. `curriculum_version`
2. `policy_version`
3. `model_version`
4. `prompt_version`
5. `embedding_model_version`
6. `cross_encoder_version`
7. `retrieval_threshold`
8. `solver_version`
9. `solver_parameters_hash`
10. `resource_catalog_version`
11. `ontology_version`
12. `ruleset_commit`
13. `tool_definitions_hash`

Captured explicitly at request inception and persisted in `decision_bundles`.

### Consequences
- Every calculation is bound to a strict version tuple.
- Replaying a decision with its original bundle guarantees reproducible results.
- Prevents silent drift caused by underlying model/prompt changes.

### Verification
- `DecisionBundle.verify()` fails fast if any version is empty or threshold out of range.
- Stored `bundle_id` is validated in audit records.
