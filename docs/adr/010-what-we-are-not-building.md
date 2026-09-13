# ADR-010: What We Are NOT Building

### Status
Accepted

### Context
Hackathons and early-stage system designs often suffer from "resume-driven architecture" — introducing complex distributed technologies that add latency, operational overhead, and failure modes without solving domain requirements.

### Decision
For EduPathAI V1, we explicitly reject:
1. **Kafka / Distributed Event Streaming:** Replaced with PostgreSQL Outbox pattern (`outbox` and `consumer_idempotency` tables) providing transactional atomicity without distributed broker overhead.
2. **Neo4j / Graph Databases:** Replaced with PostgreSQL CTEs and recursive relational tables for curriculum hypergraphs, keeping all relational and transactional integrity in one ACID engine.
3. **ClickHouse / OLAP Clusters:** Standard PostgreSQL indexes and partitioned tables easily support required analytical loads at current scale.
4. **Public Blockchain:** Replaced with SHA-256 partitioned hash-chained ledger in PostgreSQL, avoiding gas fees, key management hurdles, and slow finality.

### Consequences
- Operational simplicity: a single PostgreSQL 16+ instance with `pgvector` powers all storage, search, audit, and messaging needs.
- High developer velocity and reliable local testing.

### Verification
- Zero external broker dependencies in `docker-compose.yml` or runtime code.
