# services/solver/with_fallback.py
"""
Wraps the primary MILP solver with timeout protection, caching, and heuristic fallback.
Executes blocking OR-Tools calls outside the asyncio event loop using asyncio.to_thread.
On timeout: returns the fallback heuristic with an honest status label.
Never hangs the pipeline.
"""
from __future__ import annotations

import asyncio
import logging
import time
from typing import Any, Optional

from services.schemas import (
    SolveRequest, SolveResponse, SolverStatus,
)
from services.solver.fallback import FallbackSolver

log = logging.getLogger(__name__)


class SolverWithFallback:
    def __init__(
        self,
        primary: Any,
        fallback: Optional[FallbackSolver] = None,
        timeout_seconds: float = 30.0,
        cache: Any = None,
    ):
        self.primary = primary
        self.fallback = fallback or FallbackSolver(max_terms=12, max_credits_per_term=24)
        self.timeout = timeout_seconds
        self.cache = cache

    async def solve(self, req: SolveRequest) -> SolveResponse:
        # 1. Check Precomputation Cache first
        if self.cache is not None:
            try:
                cached = await self.cache.get(req)
                if cached:
                    cached.solve_time_ms = 0
                    return cached
            except Exception as e:
                log.warning("solver_cache_get_error", extra={"error": str(e)})

        # 2. Execute Primary Solver with Hard Timeout via asyncio.to_thread
        start = time.perf_counter()
        try:
            # Check if primary.solve is a coroutine function or sync function
            if asyncio.iscoroutinefunction(self.primary.solve):
                response = await asyncio.wait_for(
                    self.primary.solve(req),
                    timeout=self.timeout,
                )
            else:
                response = await asyncio.wait_for(
                    asyncio.to_thread(self.primary.solve, req),
                    timeout=self.timeout,
                )

            response.solve_time_ms = int((time.perf_counter() - start) * 1000)

            # Store in cache if successful
            if self.cache is not None and response.pathways:
                try:
                    await self.cache.put(req, response)
                except Exception as e:
                    log.warning("solver_cache_put_error", extra={"error": str(e)})

            return response

        except asyncio.TimeoutError:
            log.warning("solver_timeout", extra={
                "timeout_s": self.timeout,
                "student_id": req.student_id,
            })
            if asyncio.iscoroutinefunction(self.fallback.solve):
                fallback_resp = await self.fallback.solve(req)
            else:
                fallback_resp = self.fallback.solve(req)
            fallback_resp.solve_time_ms = int((time.perf_counter() - start) * 1000)
            fallback_resp.solver_status = SolverStatus.HEURISTIC
            return fallback_resp

        except Exception as e:
            log.error("solver_crashed", extra={"error": str(e)})
            if asyncio.iscoroutinefunction(self.fallback.solve):
                fallback_resp = await self.fallback.solve(req)
            else:
                fallback_resp = self.fallback.solve(req)
            fallback_resp.solve_time_ms = int((time.perf_counter() - start) * 1000)
            fallback_resp.solver_status = SolverStatus.HEURISTIC
            return fallback_resp
