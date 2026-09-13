# ADR-001: Trust Hierarchy

### Status
Accepted

### Context
In academic equivalence and pathway determination, unconstrained generative AI can hallucinate equivalencies, misinterpret statutory policies, or bypass degree awarding rules. We need an immutable principle for decision authority.

### Decision
We establish an absolute, non-inverting Trust Hierarchy:
`HUMAN > RULES > OPTIMIZATION > AI > EVIDENCE`

1. **HUMAN (Academic Committee / Faculty):** Final authority on borderline/appealed cases. Can override all lower layers with logged justification.
2. **RULES (Deterministic Policy & Recognizer Engine):** Hard legal and institutional gates (credit ceilings, modality limits, prerequisite locks).
3. **OPTIMIZATION (MILP Solver):** Mathematical guarantees on graduation feasibility and prerequisite DAG topological ordering.
4. **AI (Multi-LLM & Embedding Models):** Hypothesis generation, semantic similarity scoring, and extraction only.
5. **EVIDENCE (Syllabus & Transcript Excerpts):** Foundational grounding data.

### Consequences
- AI never directly decides `DIRECT`, `BRIDGE`, or `MISSING`.
- All model outputs pass through deterministic rule checks in `services/recognition/recognizer.py`.
- Auditing is explicit: any human override is preserved with rationale.

### Verification
- Unit and integration tests verify that deterministic rules override high AI semantic confidence when prerequisite or policy gates fail.
