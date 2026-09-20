# services/matching/explain.py
"""
Turns a completed recognition pass into the short natural-language
`ai_recommendation` string stored on every audit ledger entry.

This is additive: it does NOT touch MatchResult scores or the
deterministic classify() decision (services/recognition/recognizer.py)
that the 54 existing tests pin down. It only decides how the decision
is *narrated* in the ledger and on the audit trail UI. With no
provider configured it degrades to the same plain JSON summary the
orchestrator produced before — so behavior is unchanged when nobody
has set an API key.
"""
from __future__ import annotations

import asyncio
import json
import logging
from dataclasses import asdict
from typing import Any

from services.matching.ai_gateway_factory import build_gateway
from services.matching.providers.base import CanonicalRequest
from services.schemas import MatchResult, RecognitionStatus, RecognitionSummary

log = logging.getLogger(__name__)

_SYSTEM_PROMPT = (
    "You are an academic credit-recognition assistant. You are given the "
    "deterministic outcome of a rules engine (already decided — you cannot "
    "change it). Write a short, factual, plain-English explanation of the "
    "recognition outcome for a student and a board-of-studies reviewer. "
    "Respond ONLY as JSON: {\"summary\": string, \"confidence\": number 0-1}."
)


async def generate_ai_recommendation(
    statuses: list[tuple[MatchResult, RecognitionStatus]],
    summary: RecognitionSummary,
) -> str:
    """
    Returns the ai_recommendation string for the audit ledger.

    Tries the configured AIGateway (Gemini / OpenAI-compatible / local,
    whichever has a key set) for a one-paragraph explanation; falls back
    to the deterministic JSON summary on any failure or when no real
    provider is configured.
    """
    fallback = json.dumps(asdict(summary))

    try:
        gateway = build_gateway()
    except Exception as e:
        log.warning("ai_gateway_build_failed err=%s", e)
        return fallback

    user_prompt = _build_user_prompt(statuses, summary)
    req = CanonicalRequest(
        task="recognition_explanation",
        system_prompt=_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        response_schema={"summary": "string", "confidence": "number"},
        max_tokens=400,
        temperature=0.2,
    )

    try:
        result = await asyncio.to_thread(gateway.call, req)
    except Exception as e:
        log.warning("ai_gateway_call_failed err=%s", e)
        return fallback

    if result.all_failed or not result.responses:
        return fallback

    top = result.responses[0]
    text = top.parsed.get("summary") if isinstance(top.parsed, dict) else None
    if not text:
        return fallback

    return json.dumps({
        "summary": text,
        "provider": top.provider,
        "model": top.model,
        "confidence": top.confidence,
        # Keep the deterministic counts alongside the narrative — the
        # narrative explains, it never overrides, the rules-engine outcome.
        "deterministic_summary": asdict(summary),
    })


def _build_user_prompt(
    statuses: list[tuple[MatchResult, RecognitionStatus]],
    summary: RecognitionSummary,
) -> str:
    lines = [
        f"Totals: DIRECT={summary.direct} BRIDGE={summary.bridge} "
        f"MISSING={summary.missing} REVIEW={summary.review} "
        f"POLICY_CONFLICT={summary.policy_conflict}",
        "Per-course outcomes:",
    ]
    for match, status in statuses:
        lines.append(
            f"- {match.source_course_id} -> {match.target_course_id}: "
            f"{status.value} (outcome_coverage={match.outcome_coverage:.2f}, "
            f"semantic_score={match.semantic_score:.2f})"
        )
    return "\n".join(lines)
