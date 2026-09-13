# ADR-011: Throughput Derivation

### Status
Accepted

### Context
System capacity planning must be derived from actual higher education mobility volumes rather than arbitrary guess numbers.

### Decision
Derive national throughput requirements from Indian Higher Education statistics:
- **Total Higher Ed Population:** ~43.3 Million students (AISHE report).
- **Target ME/MC Transfer / Recognition Cohort:** ~10% annual mobility/pathway queries = 4.33 Million requests/year.
- **Academic Peak Window:** 60 business days during admissions (July-August) and semester breaks (December-January).
- **Average Workday Load:** 4,330,000 / 60 days = 72,166 requests/day.
- **Active Hours:** 5 hours/day peak concurrency = ~14,433 requests/hour = **~4.0 requests/second average**.
- **Peak Burst Factor (20x):** During counseling/admission rush = **80 requests/second peak**.

### Consequences
- Architectural target for V1: P95 latency < 2.0s at 80 peak req/s.
- Compute scaling: async FastAPI instances with asyncpg connection pooling can easily service 80 req/s on modest hardware.

### Verification
- `test/load/test_load.py` tests 100 concurrent requests to assert sub-second P95 latencies.
