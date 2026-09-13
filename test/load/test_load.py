# test/load/test_load.py
"""Load and concurrency test for decision orchestrator."""
import asyncio
import time
import pytest

from services.api.orchestrator import Orchestrator
from services.matching.stub import StubMatcher
from services.solver.stub import StubSolver
from services.bridge.resource_registry import ResourceRegistry
from services.audit.ledger import Ledger
from services.outbox.outbox import Outbox
from services.snapshot.bundle_provider import DecisionBundleProvider
from services.policy.loader import PolicyLoader


@pytest.mark.asyncio
async def test_100_concurrent_requests():
    orchestrator = Orchestrator(
        bundle_provider=DecisionBundleProvider(),
        matcher=StubMatcher(),
        solver=StubSolver(),
        ledger=Ledger(),
        outbox=Outbox(),
        resources=ResourceRegistry(),
        policy_loader=PolicyLoader(),
    )

    latencies = []

    async def one(i: int):
        start = time.perf_counter()
        resp = await orchestrator.run(f"student-{i:03d}", "BTech-CSE", "IIT-Bombay")
        latencies.append(time.perf_counter() - start)
        assert resp.decision_id is not None

    await asyncio.gather(*[one(i) for i in range(100)])

    latencies.sort()
    p50 = latencies[50]
    p95 = latencies[95]
    p99 = latencies[99]

    print(f"\n[Load Test Metrics] 100 concurrent requests: p50={p50*1000:.2f}ms p95={p95*1000:.2f}ms p99={p99*1000:.2f}ms")
    assert p95 < 2.0, f"p95 {p95}s exceeds 2.0s requirement"

    # Verify audit chain integrity across all 100 concurrent writes
    await orchestrator.ledger.verify("IIT-Bombay")
