# Interface: BridgePath & Resource Registry

## Signature
```python
def find_for_outcomes(
    missing_outcomes: list[str],
    max_results: int = 3,
) -> list[tuple[Resource, float]]: ...
```

## Contract
- Finds verified courses / lab modules from National / Institutional catalogs (NPTEL, SWAYAM, Virtual Labs, HEI offerings).
- Returns list of `(Resource, competency_coverage)` ranked in descending order of coverage.
- Supports `FORMAL_BRIDGE` (credit-granting after assessment) and `LEARNING_ONLY` modes.
