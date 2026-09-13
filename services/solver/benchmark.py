# services/solver/benchmark.py
"""
Synthetic benchmark runner for MILP solver evaluation.
"""
from __future__ import annotations

import asyncio
import time
from datetime import datetime, timezone
from uuid import uuid4

from services.schemas import (
    SolveRequest, DecisionBundle, MatchResult, Gap, Bridge, SolverStatus,
)
from services.solver.milp import MILPSolver


def make_synthetic_request(course_count: int = 12) -> SolveRequest:
    bundle = DecisionBundle(
        id=uuid4(),
        curriculum_version="benchmark-curriculum-v1",
        policy_version="benchmark-policy-v1",
        model_version="m1",
        prompt_version="p1",
        embedding_model_version="e1",
        cross_encoder_version="c1",
        retrieval_threshold=0.70,
        solver_version="ortools-9.10",
        solver_parameters_hash="bench-hash",
        resource_catalog_version="r1",
        ontology_version="o1",
        ruleset_commit="git-bench",
        tool_definitions_hash="tool-bench",
        captured_at=datetime.now(timezone.utc),
    )
    matches = [
        MatchResult(
            source_course_id=f"SRC-{i}",
            target_course_id=f"CS-{500 + i}",
            semantic_score=0.75,
            outcome_coverage=0.75,
            prerequisite_status=True,
            assessment_match=1.0,
            credit_compatibility=True,
            domain_alignment=True,
            policy_eligibility=True,
            evidence_quality=0.9,
        )
        for i in range(course_count)
    ]
    return SolveRequest(
        student_id=f"student-bench-{uuid4().hex[:6]}",
        target_programme="BTech-CSE",
        bundle=bundle,
        matches=matches,
        gaps=[],
        bridges=[],
    )


async def run_benchmark(runs: int = 20):
    solver = MILPSolver(timeout_seconds=10)
    latencies: list[float] = []
    statuses: list[str] = []

    print(f"Running MILP benchmark over {runs} synthetic instances...")
    for i in range(runs):
        req = make_synthetic_request(course_count=8 + (i % 6))
        start = time.perf_counter()
        resp = await solver.solve(req)
        elapsed = time.perf_counter() - start
        latencies.append(elapsed)
        statuses.append(resp.solver_status.value)

    latencies.sort()
    p50 = latencies[int(len(latencies) * 0.50)]
    p95 = latencies[int(len(latencies) * 0.95)]
    p99 = latencies[int(len(latencies) * 0.99)]

    print("\n--- Benchmark Results ---")
    print(f"p50: {p50*1000:.2f}ms")
    print(f"p95: {p95*1000:.2f}ms")
    print(f"p99: {p99*1000:.2f}ms")
    print(f"max: {latencies[-1]*1000:.2f}ms")
    print(f"Status distribution: {dict((s, statuses.count(s)) for s in set(statuses))}")


if __name__ == "__main__":
    asyncio.run(run_benchmark())
