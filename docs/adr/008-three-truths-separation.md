# ADR-008: Three Truths Separation

### Status
Accepted

### Context
Conflating verified student historical data, AI-generated predictions, and official institutional determinations leads to corruption of permanent academic records.

### Decision
Strictly separate data models into Three Truths:
1. **Record Truth:** Immutable historical facts (courses taken, credits earned, syllabus texts, student identifiers tokenized).
2. **Inference Truth:** Probabilistic machine outputs (embeddings, similarity scores, candidate match hypotheses, LLM extraction output).
3. **Decision Truth:** Legally binding institutional outcomes (granted recognitions, approved pathways, committee overrides, hash-chained audit events).

### Consequences
- Inference outputs are never written directly to official student records.
- If AI inference changes over time (new model weights), historical Decision Truth remains unchanged.

### Verification
- Schema separation across `students`, `courses`, `recognition_decisions`, and `audit_ledger`.
