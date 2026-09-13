import pytest
from services.solver.milp import MILPSolver
from services.solver.with_fallback import SolverWithFallback
from services.solver.fallback import FallbackSolver
from services.solver.cache import SolverCache
from services.api.orchestrator import Orchestrator
from services.matching.stub import StubMatcher
from services.bridge.resource_registry import ResourceRegistry
from services.audit.ledger import Ledger
from services.outbox.outbox import Outbox
from services.snapshot.bundle_provider import DecisionBundleProvider
from services.policy.loader import PolicyLoader


@pytest.mark.asyncio
async def test_full_pathway_solve_with_milp():
    cache = SolverCache()
    primary_solver = MILPSolver(max_terms=8, timeout_seconds=10)
    fallback_solver = FallbackSolver(max_terms=8)
    solver = SolverWithFallback(primary=primary_solver, fallback=fallback_solver, timeout_seconds=10, cache=cache)

    orchestrator = Orchestrator(
        bundle_provider=DecisionBundleProvider(),
        matcher=StubMatcher(),
        solver=solver,
        ledger=Ledger(),
        outbox=Outbox(),
        resources=ResourceRegistry(),
        policy_loader=PolicyLoader(),
    )

    resp = await orchestrator.run("student-milp-001", "BTech-CSE", "IIT-Bombay")
    assert len(resp.pathways) == 3

    # Check that FASTEST mode has fewer or equal terms than BALANCED
    fastest = next(p for p in resp.pathways if p.mode.value == "FASTEST")
    balanced = next(p for p in resp.pathways if p.mode.value == "BALANCED")
    assert fastest.terms <= balanced.terms

    # Verify audit chain integrity
    await orchestrator.ledger.verify("IIT-Bombay")


@pytest.mark.asyncio
async def test_solver_timeout_returns_heuristic():
    # Primary solver with 0s timeout forces fallback execution
    primary_slow = MILPSolver(timeout_seconds=0)
    solver = SolverWithFallback(primary=primary_slow, fallback=FallbackSolver(), timeout_seconds=0.01)

    orchestrator = Orchestrator(
        bundle_provider=DecisionBundleProvider(),
        matcher=StubMatcher(),
        solver=solver,
        ledger=Ledger(),
        outbox=Outbox(),
        resources=ResourceRegistry(),
        policy_loader=PolicyLoader(),
    )

    resp = await orchestrator.run("student-timeout-001", "BTech-CSE", "IIT-Bombay")
    assert len(resp.pathways) == 3
