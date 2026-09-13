# services/policy/loader.py
"""Policy loader. Loads institutional and statutory credit policies."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any


class PolicyLoader:
    def __init__(self, policy_dir: Path = Path("policy/institutions")):
        self.policy_dir = policy_dir
        self._cache: dict[str, dict] = {}

    async def load(self, institution: str, programme: str, policy_version: str) -> dict[str, Any]:
        cache_key = f"{institution}:{programme}:{policy_version}"
        if cache_key in self._cache:
            return self._cache[cache_key]

        policy_file = self.policy_dir / f"{institution.lower().replace('-', '_').replace(' ', '_')}.json"
        if policy_file.exists():
            policy_data = json.loads(policy_file.read_text(encoding="utf-8"))
        else:
            # Standard NEP 2020 Default Policy
            policy_data = {
                "institution": institution,
                "programme": programme,
                "policy_version": policy_version,
                "max_transfer_credits_percent": 50,
                "min_cgpa_for_transfer": 6.0,
                "allow_online_bridge": True,
                "max_bridge_credits_per_term": 8,
                "direct_recognition_threshold": 0.90,
                "bridge_recognition_threshold": 0.60,
            }

        self._cache[cache_key] = policy_data
        return policy_data
