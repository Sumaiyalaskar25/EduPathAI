# Interface: Matcher

## Signature
```python
async def match(
    student_id: str,
    target_programme: str,
    bundle: DecisionBundle,
) -> list[MatchResult]: ...
```

## Contract
- MUST return `MatchResult` for every (source, target) candidate pair above retrieval threshold
- MUST NOT make final recognition decisions — that is the recognizer's job
- MUST include evidence refs with page numbers
- MUST be pure with respect to the `bundle` — same bundle → same output

## Errors
- `ProviderUnavailable` — should NOT be raised; use fallback chain
- `SchemaValidationError` — raises (programming bug)

## Performance
- p95 < 2s for 100 candidate pairs
- MUST be cancellable via `asyncio.CancelledError`
