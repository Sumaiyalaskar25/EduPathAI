# Solver Fleet Sizing — Erlang-C Analysis

## Inputs
- Peak arrival rate: $\lambda = 8$ requests/second (derived in ADR-011)
- Average solve time: $E[S] = 2.0$ seconds
- Service rate per worker: $\mu = 1 / E[S] = 0.5$ requests/second
- Target: p99 latency $< 30$ seconds (hard timeout boundary)
- Target: probability of queueing ($P_{\text{wait}}$) $< 0.10$

## Base Requirement (No Queueing)
$$\rho = \frac{\lambda}{c \cdot \mu} < 1 \implies c > \frac{\lambda}{\mu} = \frac{8}{0.5} = 16 \text{ workers}$$

## With Safety Margin ($P_{\text{wait}} < 0.10$)
Using the Erlang-C formula for $M/M/c$:
- Offered load: $A = \lambda \times E[S] = 8 \times 2.0 = 16\text{ Erlangs}$
- $c = 22 \implies P_{\text{wait}} \approx 0.111$
- $c = 23 \implies P_{\text{wait}} \approx 0.070$
- **Baseline Worker Count:** $c = 23\text{ workers}$ is the exact mathematical minimum satisfying $P_{\text{wait}} < 0.10$.

## Deployment Profiles

### 1. Prototype & Evaluation (SIH Baseline)
- **Pool Size:** Bounded 4–8 worker processes with async queueing.
- **Suitability:** Validates complete pipeline, timeout degradation, and cache behavior with zero resource exhaustion on standard workstation / single-node VM.

### 2. Production Autoscaling (National Scale Surge)
- **Steady State (with 85% cache hit):** $\lambda_{\text{eff}} = 8 \times 0.15 = 1.2\text{ req/s} \implies A_{\text{eff}} = 2.4\text{ Erlangs} \implies c \approx 5\text{ workers}$.
- **Admission Surge (20× burst):** $\lambda_{\text{burst}} = 160\text{ req/s} \implies \lambda_{\text{burst, eff}} = 24\text{ req/s} \implies A_{\text{burst, eff}} = 48\text{ Erlangs}$.
- **Surge Fleet:** **64 workers** (providing $1.33\times$ safety margin above the 48 Erlang offered load).

## Metrics Emitted & Monitored
- `solver_calls_total{status}` (Prometheus Counter)
- `solver_latency_seconds` (Prometheus Histogram)
- `solver_cache_hits_total` / `solver_cache_misses_total`
- `solver_active_workers` & `solver_queue_depth` (Prometheus Gauges)
