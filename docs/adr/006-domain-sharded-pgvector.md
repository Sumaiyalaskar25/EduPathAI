# ADR-006: Domain-Sharded pgvector

### Status
Accepted

### Context
Global vector search across all higher-ed disciplines causes false-positive collisions (e.g., "Fluid Mechanics" in Mechanical Engineering vs "Fluid Dynamics" in Game Physics or Chemical Engineering).

### Decision
Partition and filter vector embeddings by disciplinary domain (e.g. `domain = 'CSE'`) in PostgreSQL using `pgvector` with HNSW indexes. Deliberately restrict cross-domain nearest-neighbor queries unless explicitly requested by interdisciplinary policy.

### Consequences
- Search space per query decreases 10x-50x, boosting HNSW query speed.
- Irrelevant cross-disciplinary semantic matches are pruned before expensive cross-encoding.
- Cross-domain recall loss is an intentional, domain-preserving feature.

### Verification
- Index definitions on `learning_outcomes` and domain filters in matcher queries.
