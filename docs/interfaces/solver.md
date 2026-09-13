# Interface: Solver

## Signature
```python
async def solve(req: SolveRequest) -> SolveResponse: ...
```

## Contract
- MUST optimize course term allocations respecting prerequisite topological constraints and credit caps.
- MUST return 3 distinct pathway modes: `FASTEST`, `BALANCED`, and `MAX_PRESERVATION`.
- MUST return status: `OPTIMAL`, `FEASIBLE_NOT_OPTIMAL`, or `HEURISTIC`.
- MUST include per-term breakdown of courses and bridge requirements.

## Invariants
- No course scheduled before its prerequisite term is completed.
- Maximum term credit limits (e.g. 24 credits/term) strictly enforced.
- Solve time budget: max 30 seconds before degrading to `HEURISTIC` fallback.

## Errors
- `InfeasibleError`: When student cannot graduate within statutory maximum semesters.
- `TimeoutError`: Handled internally by `SolverWithFallback` returning greedy heuristic plan.
