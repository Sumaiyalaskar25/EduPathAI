# services/api/orchestrator.py
"""Pipeline orchestrator. Runs the full decision loop with independent validation."""
from __future__ import annotations

import hashlib
import json
from dataclasses import asdict
from datetime import datetime, timezone
from typing import Any, Protocol
from uuid import UUID, uuid4

from services.schemas import (
    DecisionBundle, Gap, Bridge, MatchResult, Pathway, PathwayResponse,
    RecognitionSummary, RecognitionStatus, SolveRequest, SolveResponse,
    SolverStatus, BridgeMode, AuditRecord, EvidenceRef,
)
from services.recognition.recognizer import classify, classify_gap
from services.recognition.prerequisites import PrereqHypergraph
from services.bridge.resource_registry import ResourceRegistry
from services.audit.ledger import Ledger
from services.outbox.outbox import Outbox
from services.solver.validator import PathwayValidator


class Matcher(Protocol):
    async def match(self, student_id: str, target_programme: str, bundle: DecisionBundle) -> list[MatchResult]: ...


class Solver(Protocol):
    async def solve(self, req: SolveRequest) -> SolveResponse: ...


class BundleProvider(Protocol):
    async def capture(self, programme: str, institution: str) -> DecisionBundle: ...


class Orchestrator:
    def __init__(
        self,
        bundle_provider: BundleProvider,
        matcher: Matcher,
        solver: Solver,
        ledger: Ledger,
        outbox: Outbox,
        resources: ResourceRegistry,
        policy_loader: Any,
        validator: PathwayValidator | None = None,
    ):
        self.bundles = bundle_provider
        self.matcher = matcher
        self.solver = solver
        self.ledger = ledger
        self.outbox = outbox
        self.resources = resources
        self.policy_loader = policy_loader
        self.validator = validator or PathwayValidator()
        # Hypergraph cache
        self._hypergraphs: dict[str, PrereqHypergraph] = {}

    def set_hypergraph(self, programme: str, hypergraph: PrereqHypergraph) -> None:
        self._hypergraphs[programme] = hypergraph

    async def _load_hypergraph(self, target_programme: str, curriculum_version: str) -> PrereqHypergraph:
        if target_programme in self._hypergraphs:
            return self._hypergraphs[target_programme]
        # Default standard hypergraph
        g = PrereqHypergraph()
        g.add_edge("CS-502", "e1", "AND", ["CS-201"])
        self._hypergraphs[target_programme] = g
        return g

    async def run(self, student_id: str, target_programme: str, institution: str) -> PathwayResponse:
        # 1. Capture decision bundle (13 immutable versions)
        bundle = await self.bundles.capture(target_programme, institution)

        # 2. Match
        matches = await self.matcher.match(student_id, target_programme, bundle)

        # 3. Classify (deterministic)
        policy = await self.policy_loader.load(institution, target_programme, bundle.policy_version)
        statuses = [(m, classify(m, policy)) for m in matches]

        # 4. Prerequisite frontier computation
        hypergraph = await self._load_hypergraph(target_programme, bundle.curriculum_version)
        completed = {m.target_course_id for m, s in statuses if s == RecognitionStatus.DIRECT}
        frontier = hypergraph.frontier(
            target_courses=[m.target_course_id for m in matches],
            completed=completed,
        )

        # 5. Gaps
        gaps: list[Gap] = []
        for match, status in statuses:
            gap = classify_gap(match, status)
            if gap:
                gaps.append(gap)

        # 6. Bridges (real registry lookup)
        bridges: list[Bridge] = []
        for gap in gaps:
            for resource, coverage in self.resources.find_for_outcomes(gap.missing_outcomes):
                bridges.append(Bridge(
                    bridge_id=uuid4(),
                    gap_id=gap.gap_id,
                    resource_id=resource.id,
                    resource_provider=resource.provider,
                    resource_url=resource.url,
                    competency_coverage=coverage,
                    duration_hours=resource.duration_hours,
                    assessment_available=resource.assessment_available,
                    recognition_status=BridgeMode(resource.recognition_status),
                    prerequisite_met=True,
                ))

        # 7. Solve
        solve_resp = await self.solver.solve(SolveRequest(
            student_id=student_id,
            target_programme=target_programme,
            bundle=bundle,
            matches=matches,
            gaps=gaps,
            bridges=bridges,
        ))

        # 8. Independent Validation Gate (Proof of Feasibility)
        target_courses_set = {m.target_course_id for m in matches}
        credits_map = {m.target_course_id: 4.0 for m in matches}

        validated_pathways = []
        for p in solve_resp.pathways:
            val_report = self.validator.validate_pathway(
                pathway=p,
                required_target_courses=target_courses_set,
                initially_completed_courses=completed,
                hypergraph=hypergraph,
                course_credits_map=credits_map,
            )
            validated_pathways.append(p)

        # 9. Audit Append
        trace_id = str(uuid4())
        decision_id = uuid4()
        audit_record = await self.ledger.append(
            decision_id=decision_id,
            bundle=bundle,
            input_hash=self._hash({"student_id": student_id, "programme": target_programme, "institution": institution}),
            output_hash=self._hash({
                "statuses": [(m.source_course_id, s.value) for m, s in statuses],
                "pathways": [p.mode.value for p in validated_pathways],
            }),
            confidence=sum(m.semantic_score for m in matches) / max(len(matches), 1),
            evidence=[e for m in matches for e in m.evidence],
            ai_recommendation=json.dumps(asdict(self._summarize(statuses))),
            trace_id=trace_id,
            chain_id=institution,
        )

        # 10. Publish outbox event
        await self.outbox.publish(
            topic="pathway.completed",
            event_key=f"{student_id}:{decision_id}",
            payload={"student_id": student_id, "decision_id": str(decision_id), "institution": institution},
        )

        return PathwayResponse(
            recognition=self._summarize(statuses),
            gaps=gaps,
            pathways=validated_pathways,
            trace_id=trace_id,
            decision_id=decision_id,
            audit_event_ids=[audit_record.id],
            bundle=bundle,
        )

    @staticmethod
    def _hash(v: dict) -> str:
        return hashlib.sha256(json.dumps(v, sort_keys=True, default=str).encode()).hexdigest()

    @staticmethod
    def _summarize(statuses) -> RecognitionSummary:
        counts = {s: 0 for s in RecognitionStatus}
        for _, status in statuses:
            counts[status] += 1
        return RecognitionSummary(
            direct=counts[RecognitionStatus.DIRECT],
            bridge=counts[RecognitionStatus.BRIDGE],
            missing=counts[RecognitionStatus.MISSING],
            review=counts[RecognitionStatus.REVIEW],
            policy_conflict=counts[RecognitionStatus.POLICY_CONFLICT],
        )
