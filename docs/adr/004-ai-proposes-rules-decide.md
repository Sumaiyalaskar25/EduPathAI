# ADR-004: AI Proposes, Rules Decide

### Status
Accepted

### Context
Using a single scalar confidence score (`confidence >= 0.9 -> DIRECT`) hides why an equivalence failed and allows LLM hallucination to directly grant credit.

### Decision
The Matcher returns an 8-field structured `MatchResult`:
1. `semantic_score` (cosine similarity)
2. `outcome_coverage` (fraction of learning outcomes matched)
3. `prerequisite_status` (boolean flag from hypergraph)
4. `assessment_match` (theory/lab/practical alignment)
5. `credit_compatibility` (within institution margin)
6. `domain_alignment` (disciplinary compatibility)
7. `policy_eligibility` (HEI statutory acceptance)
8. `evidence_quality` (provenance metric)

The deterministic recognizer evaluates these fields in strict hierarchical order.

### Consequences
- Explainability is native: students and committees see exact outcome gaps and modality discrepancies.
- Zero unsupervised AI decision making.

### Verification
- Tested via `test_recognizer_direct`, `test_recognizer_bridge_missing_outcomes`, and `test_recognizer_assessment_gap`.
