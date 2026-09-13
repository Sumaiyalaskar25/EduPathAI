# Interface Acceptance — Member 4

I, Member 4, accept the following frozen contracts from Member 1:

## SolveRequest (frozen)
- `student_id`: str
- `target_programme`: str
- `bundle`: DecisionBundle
- `matches`: list[MatchResult]
- `gaps`: list[Gap]
- `bridges`: list[Bridge]

## SolveResponse (frozen)
- `pathways`: list[Pathway]
- `solver_status`: SolverStatus (OPTIMAL | FEASIBLE_NOT_OPTIMAL | HEURISTIC)
- `solve_time_ms`: int

## Pathway (frozen)
- `mode`: PathwayMode (FASTEST | BALANCED | MAX_PRESERVATION)
- `terms`: int
- `bridge_burden`: float
- `terms_plan`: list[TermPlan]

## TermPlan (frozen)
- `term_number`: int
- `courses`: list[str]
- `bridges`: list[str]

## Solver protocol
```python
async def solve(req: SolveRequest) -> SolveResponse: ...
```

## Non-negotiables
- I NEVER invent new fields in Pathway / TermPlan.
- I NEVER return OPTIMAL after a timeout. I return FEASIBLE_NOT_OPTIMAL or HEURISTIC.
- I ALWAYS respect hard constraints. If infeasible, I return a well-formed response, not a crash.
- I expose solver_version and solver_parameters_hash to Member 1's DecisionBundle.

Signed: Member 4, Hour 0.
