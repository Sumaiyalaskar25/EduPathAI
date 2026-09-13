# Interface: Schema & Data Contracts

## Location
`services/schemas.py`

## Invariants
- Immutable version tuple in `DecisionBundle`.
- Explicit enum states for `RecognitionStatus` (`DIRECT`, `BRIDGE`, `MISSING`, `REVIEW`, `POLICY_CONFLICT`).
- Structured `MatchResult` with 8 diagnostic metrics rather than blackbox scores.
- Strict typing with Pydantic v2 and Python Dataclasses.
