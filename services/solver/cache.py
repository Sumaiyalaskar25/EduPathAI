# services/solver/cache.py
"""
Precomputation cache for solver responses.
Keyed on stable hash of (student_id, target_programme, curriculum_version, policy_version, matches_hash).
"""
from __future__ import annotations

import hashlib
import json
from dataclasses import asdict
from typing import Any, Dict, Optional

from services.schemas import (
    SolveRequest, SolveResponse, Pathway, TermPlan, SolverStatus, PathwayMode,
)


class SolverCache:
    def __init__(self, db: Any = None, ttl_seconds: int = 3600):
        self.db = db
        self.ttl_seconds = ttl_seconds
        self._mem_cache: Dict[str, SolveResponse] = {}

    @staticmethod
    def compute_key(req: SolveRequest) -> str:
        """Stable deterministic content key."""
        curriculum_ver = req.bundle.curriculum_version if req.bundle else "v1"
        policy_ver = req.bundle.policy_version if req.bundle else "p1"
        matches_repr = sorted([
            (m.source_course_id, m.target_course_id, round(m.outcome_coverage, 2))
            for m in req.matches
        ])
        matches_hash = hashlib.sha256(json.dumps(matches_repr, sort_keys=True).encode("utf-8")).hexdigest()[:16]

        payload = {
            "student_id": req.student_id,
            "target_programme": req.target_programme,
            "curriculum_version": curriculum_ver,
            "policy_version": policy_ver,
            "matches_hash": matches_hash,
        }
        return hashlib.sha256(json.dumps(payload, sort_keys=True).encode("utf-8")).hexdigest()

    async def get(self, req: SolveRequest) -> Optional[SolveResponse]:
        key = self.compute_key(req)
        if self.db is None:
            cached = self._mem_cache.get(key)
            if cached:
                cached.solve_time_ms = 0
            return cached

        row = await self.db.fetchrow(
            """
            SELECT response FROM solver_cache
            WHERE cache_key = $1 AND expires_at > NOW()
            """,
            key,
        )
        if not row:
            return None

        raw = row["response"]
        data = json.loads(raw) if isinstance(raw, str) else raw
        pathways = [
            Pathway(
                mode=PathwayMode(p["mode"]),
                terms=p["terms"],
                bridge_burden=p["bridge_burden"],
                terms_plan=[TermPlan(**tp) for tp in p["terms_plan"]],
            )
            for p in data["pathways"]
        ]
        return SolveResponse(
            pathways=pathways,
            solver_status=SolverStatus(data["solver_status"]),
            solve_time_ms=0,
        )

    async def put(self, req: SolveRequest, resp: SolveResponse) -> None:
        key = self.compute_key(req)
        if self.db is None:
            self._mem_cache[key] = resp
            return

        serialized = {
            "pathways": [asdict(p) for p in resp.pathways],
            "solver_status": resp.solver_status.value,
            "solve_time_ms": resp.solve_time_ms,
        }
        await self.db.execute(
            """
            INSERT INTO solver_cache (cache_key, response, expires_at)
            VALUES ($1, $2, NOW() + INTERVAL '1 second' * $3)
            ON CONFLICT (cache_key) DO UPDATE
            SET response = EXCLUDED.response, expires_at = EXCLUDED.expires_at
            """,
            key, serialized, self.ttl_seconds,
        )
