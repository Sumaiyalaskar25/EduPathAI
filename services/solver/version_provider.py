# services/solver/version_provider.py
"""
Member 4 exposes solver version + parameters hash to Member 1's DecisionBundle.
"""
from __future__ import annotations

import hashlib
import json


class SolverVersionProvider:
    SOLVER_VERSION = "edupathai-milp-v1.0.0"

    # These are the tunable parameters. Any change -> new hash -> new reproducible decisions.
    DEFAULT_PARAMS = {
        "timeout_seconds": 30,
        "max_terms": 12,
        "max_credits_per_term": 24,
        "min_credits_per_term": 12,
        "final_term_exception": True,
        "bridge_weight": 1.0,
        "time_weight": 1.0,
        "workload_variance_weight": 0.5,
        "uncertainty_weight": 0.3,
        "preservation_weight": 2.0,
    }

    def solver_version(self) -> str:
        return self.SOLVER_VERSION

    def solver_parameters_hash(self) -> str:
        canonical = json.dumps(self.DEFAULT_PARAMS, sort_keys=True)
        return hashlib.sha256(canonical.encode("utf-8")).hexdigest()[:16]
