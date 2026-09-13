# services/solver/metrics.py
"""
Prometheus observability metrics for the solver subsystem.
"""
from __future__ import annotations

from prometheus_client import Counter, Histogram, Gauge

SOLVE_CALLS = Counter("solver_calls_total", "Total solver invocations", ["status", "mode"])
SOLVE_LATENCY = Histogram("solver_latency_seconds", "Solver latency in seconds", ["status"])
CACHE_HITS = Counter("solver_cache_hits_total", "Solver precomputation cache hits")
CACHE_MISSES = Counter("solver_cache_misses_total", "Solver precomputation cache misses")
ACTIVE_WORKERS = Gauge("solver_active_workers", "Currently active solver worker processes")
QUEUE_DEPTH = Gauge("solver_queue_depth", "Pending pathway solve requests in queue")
