# services/schemas.py
"""
Frozen interface contract for EduPathAI.
Owner: Member 1 (Principal Architect)
Frozen at: Hour 0
Any change requires re-negotiation with Member 2, 3, 4.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Optional
from uuid import UUID, uuid4


# ============================================================
# ENUMS
# ============================================================
class RecognitionStatus(str, Enum):
    DIRECT = "DIRECT"
    BRIDGE = "BRIDGE"
    MISSING = "MISSING"
    REVIEW = "REVIEW"
    POLICY_CONFLICT = "POLICY_CONFLICT"


class GapType(str, Enum):
    KNOWLEDGE = "KNOWLEDGE"
    PREREQUISITE = "PREREQUISITE"
    ASSESSMENT = "ASSESSMENT"
    ADMINISTRATIVE = "ADMINISTRATIVE"


class BridgeMode(str, Enum):
    LEARNING_ONLY = "LEARNING_ONLY"
    FORMAL_BRIDGE = "FORMAL_BRIDGE"


class PathwayMode(str, Enum):
    FASTEST = "FASTEST"
    BALANCED = "BALANCED"
    MAX_PRESERVATION = "MAX_PRESERVATION"


class SolverStatus(str, Enum):
    OPTIMAL = "OPTIMAL"
    FEASIBLE_NOT_OPTIMAL = "FEASIBLE_NOT_OPTIMAL"
    HEURISTIC = "HEURISTIC"


# ============================================================
# DECISION BUNDLE — replaces Snapshot
# Captures EVERY version that could change the output.
# This is the reproducibility object.
# ============================================================
@dataclass(frozen=True)
class DecisionBundle:
    """
    Immutable version tuple captured at request time.
    Every downstream decision MUST reference this.

    NOTE ON ATOMICITY:
    This is NOT a globally-atomic snapshot of "what was current at time T".
    It is a single immutable version tuple captured before downstream
    computation. If you need globally-atomic as-of semantics, route
    through a VersionRegistry with transaction boundaries.
    """
    id: UUID
    # Core versions
    curriculum_version: str
    policy_version: str
    model_version: str
    prompt_version: str
    # Retrieval / embedding versions (previously missing)
    embedding_model_version: str
    cross_encoder_version: str
    retrieval_threshold: float
    # Solver versions
    solver_version: str
    solver_parameters_hash: str
    # Resource catalogue (for BridgePath)
    resource_catalog_version: str
    # Ontology / rules
    ontology_version: str
    ruleset_commit: str
    # Tool definitions
    tool_definitions_hash: str
    # Capture metadata
    captured_at: datetime

    def verify(self) -> None:
        """Fail fast if any version is missing."""
        for field_name in (
            "curriculum_version", "policy_version", "model_version",
            "prompt_version", "embedding_model_version", "cross_encoder_version",
            "solver_version", "solver_parameters_hash", "resource_catalog_version",
            "ontology_version", "ruleset_commit", "tool_definitions_hash",
        ):
            value = getattr(self, field_name)
            if not value:
                raise ValueError(f"decision_bundle: missing {field_name}")
        if not (0.0 <= self.retrieval_threshold <= 1.0):
            raise ValueError("decision_bundle: retrieval_threshold out of range")

    def fingerprint(self) -> str:
        """Stable hash for cache keys."""
        parts = [
            self.curriculum_version,
            self.policy_version,
            self.model_version,
            self.prompt_version,
            self.embedding_model_version,
            self.cross_encoder_version,
            f"{self.retrieval_threshold:.4f}",
            self.solver_version,
            self.solver_parameters_hash,
            self.resource_catalog_version,
            self.ontology_version,
            self.ruleset_commit,
            self.tool_definitions_hash,
        ]
        return "|".join(parts)


# ============================================================
# MATCH RESULT — structured, not just confidence
# ============================================================
@dataclass
class EvidenceRef:
    source_doc_id: str
    source_page: str
    target_doc_id: str
    target_page: str
    similarity: float


@dataclass
class MatchResult:
    """
    Structured match between a source course and a target course.

    The matcher returns ALL of these fields.
    The recognizer (deterministic, Member 1) decides the final status.
    """
    source_course_id: str
    target_course_id: str
    # Structured scores — NOT just confidence
    semantic_score: float          # cosine similarity of course descriptions
    outcome_coverage: float        # fraction of target LOs covered by source LOs
    prerequisite_status: bool      # all prerequisites satisfied?
    assessment_match: float        # theory/lab/practical alignment 0..1
    credit_compatibility: bool     # credits within tolerance?
    domain_alignment: bool         # same disciplinary domain?
    policy_eligibility: bool       # receiving HEI permits this mode?
    evidence_quality: float        # provenance completeness 0..1
    # Evidence
    evidence: list[EvidenceRef] = field(default_factory=list)
    # Diagnostic
    missing_outcomes: list[str] = field(default_factory=list)


# ============================================================
# GAP / BRIDGE
# ============================================================
@dataclass
class Gap:
    gap_id: UUID
    gap_type: GapType
    description: str
    missing_outcomes: list[str] = field(default_factory=list)


@dataclass
class Bridge:
    """
    Real BridgePath output — not a hardcoded NPTEL link.
    """
    bridge_id: UUID
    gap_id: UUID
    resource_id: str
    resource_provider: str        # NPTEL / SWAYAM / VLAB / HEI
    resource_url: str
    competency_coverage: float    # how much of the gap this covers
    duration_hours: int
    assessment_available: bool
    recognition_status: BridgeMode
    prerequisite_met: bool


# ============================================================
# PATHWAY
# ============================================================
@dataclass
class TermPlan:
    term_number: int
    courses: list[str]
    bridges: list[str]


@dataclass
class Pathway:
    mode: PathwayMode
    terms: int
    bridge_burden: float
    terms_plan: list[TermPlan] = field(default_factory=list)


# ============================================================
# SOLVE REQUEST / RESPONSE
# ============================================================
@dataclass
class SolveRequest:
    student_id: str
    target_programme: str
    bundle: DecisionBundle
    matches: list[MatchResult]
    gaps: list[Gap]
    bridges: list[Bridge]


@dataclass
class SolveResponse:
    pathways: list[Pathway]
    solver_status: SolverStatus
    solve_time_ms: int


# ============================================================
# AUDIT RECORD
# ============================================================
@dataclass
class AuditRecord:
    id: UUID
    recommendation_id: UUID
    decision_id: UUID              # NEW: distinct from trace and audit
    previous_hash: str
    current_hash: str
    chain_id: str                  # NEW: partitioned chain
    bundle_id: UUID
    input_hash: str
    output_hash: str
    confidence: float
    evidence: list[EvidenceRef]
    ai_recommendation: str
    human_decision: Optional[str]
    trace_id: str                  # OpenTelemetry trace — NOT the same as audit id
    timestamp: datetime
    # Set only on human-review ledger entries (HEI approve/reject).
    auditor_name: Optional[str] = None
    auditor_role: Optional[str] = None


# ============================================================
# API RESPONSE
# ============================================================
@dataclass
class RecognitionSummary:
    direct: int
    bridge: int
    missing: int
    review: int
    policy_conflict: int


@dataclass
class PathwayResponse:
    recognition: RecognitionSummary
    gaps: list[Gap]
    pathways: list[Pathway]
    trace_id: str
    decision_id: UUID
    audit_event_ids: list[UUID]
    bundle: DecisionBundle
    # Populated by the orchestrator — the raw signals behind `recognition`/`gaps`.
    matches: list[MatchResult] = field(default_factory=list)
    bridges: list[Bridge] = field(default_factory=list)
