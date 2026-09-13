# ADR-012: Solver Fleet Sizing

### Status
Accepted

### Context
MILP optimization (OR-Tools) for pathway scheduling is CPU-bound. If solver workers are undersized, request queuing explodes during admission spikes.

### Decision
Apply queueing theory (Erlang-C / $M/M/c$ queue model) to size the solver worker pool:
- **Arrival Rate ($\lambda$):** 80 req/s peak.
- **Cache Hit Rate:** ~75% of queries hit pre-solved curriculum pathway templates, leaving 25% novel MILP solves $\implies \lambda_{solve} = 20 \text{ req/s}$.
- **Service Time ($\mu^{-1}$):** Mean solve time 1.2 seconds $\implies \mu = 0.833 \text{ solves/sec/worker}$.
- **Offered Load ($A = \lambda / \mu$):** $20 \times 1.2 = 24$ Erlangs of compute.
- **Target Queue Probability ($P_{wait} < 1\%$):**
  For $A = 24$ and target P99 wait time $< 100\text{ms}$, Erlang-C yields $c \ge 36$ CPU worker threads.
- Sizing with $1.75\times$ safety headroom $\implies$ **64 worker processes** across solver pool.

### Consequences
- Under 80 req/s peak, average queuing delay is $< 15\text{ms}$.
- Solvers are deployed as stateless workers behind Celery/async worker pools with 30-second timeout fallback.

### Verification
- Benchmarked via solver latency monitoring and fallback test triggers.
