# services/matching/ai_gateway_factory.py
"""
Builds the AIGateway (services/matching/gateway.py) from whatever
provider API keys are set in the environment.

This is the wiring the pipeline was missing: gateway.py, consensus.py,
and all four provider adapters (gemini / openai_compatible / local)
already existed and were fully unit-tested, but nothing in the live
request path (orchestrator.py) constructed or called an AIGateway.
build_gateway() is that missing wire.

Model-agnostic by design: add GEMINI_API_KEY / OPENAI_API_KEY /
DEEPSEEK_API_KEY / KIMI_API_KEY to .env and the gateway picks it up
automatically, in that priority order, without any code change.
With zero keys set, the gateway still returns a valid (low-confidence)
result via LocalProvider — it never raises.
"""
from __future__ import annotations

import logging
import os

from services.matching.cost_tracker import CostTracker
from services.matching.gateway import AIGateway
from services.matching.providers.base import Provider
from services.matching.providers.local import LocalProvider

log = logging.getLogger(__name__)

_PROVIDER_PRIORITY = ["gemini", "openai", "deepseek", "kimi"]


def _try_build(name: str) -> Provider | None:
    try:
        if name == "gemini":
            if not os.environ.get("GEMINI_API_KEY"):
                return None
            from services.matching.providers.gemini import GeminiProvider
            return GeminiProvider()
        if name in ("openai", "deepseek", "kimi"):
            preset_env = {"openai": "OPENAI_API_KEY", "deepseek": "DEEPSEEK_API_KEY", "kimi": "KIMI_API_KEY"}[name]
            if not os.environ.get(preset_env):
                return None
            from services.matching.providers.openai_compatible import OpenAICompatibleProvider
            return OpenAICompatibleProvider(preset=name)
    except Exception as e:
        log.warning("provider_init_failed provider=%s err=%s", name, e)
        return None
    return None


def build_gateway(cost_tracker: CostTracker | None = None) -> AIGateway:
    providers: list[Provider] = []
    for name in _PROVIDER_PRIORITY:
        p = _try_build(name)
        if p is not None:
            providers.append(p)
            log.info("ai_gateway: provider configured provider=%s", name)

    # Always end with the local no-op provider: guarantees a response
    # (routing to REVIEW downstream) even with zero external keys.
    providers.append(LocalProvider())

    return AIGateway(providers=providers, cost_tracker=cost_tracker or CostTracker())


def configured_provider_names() -> list[str]:
    """For the DecisionBundle / UI: which real (non-local) providers are live."""
    return [name for name in _PROVIDER_PRIORITY if _try_build(name) is not None]
