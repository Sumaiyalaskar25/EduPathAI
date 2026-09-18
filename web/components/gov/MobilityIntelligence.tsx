"use client";

import { motion } from "framer-motion";
import {
  Users,
  Building2,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Info,
  ShieldAlert,
  Activity,
  Target,
  Zap,
} from "lucide-react";
import {
  DEMO_GOV_STATS,
  DEMO_MOBILITY_FLOWS,
  DEMO_FRICTION_COURSES,
  DEMO_MOBILITY_TREND,
  DEMO_REGION_SIGNALS,
  DEMO_POLICY_SIGNALS,
  DEMO_LATENCY_STATS,
  type PolicySignal,
} from "@/lib/constants/demo-gov";
import { cn } from "@/lib/utils/cn";

/* ───── number formatting ───── */

function formatNum(n: number): string {
  if (n >= 10_000_000) return `${(n / 10_000_000).toFixed(1)}Cr`;
  if (n >= 100_000) return `${(n / 100_000).toFixed(1)}L`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

/* ───── 1. HERO STATS ───── */

function HeroStats() {
  const items = [
    { label: "Students enrolled",  value: formatNum(DEMO_GOV_STATS.totalStudents),   Icon: Users,        tone: "navy" },
    { label: "HEIs integrated",    value: DEMO_GOV_STATS.heisIntegrated,             Icon: Building2,    tone: "emerald" },
    { label: "Credits transferred",value: formatNum(DEMO_GOV_STATS.creditsTransferred), Icon: TrendingUp, tone: "emerald" },
    { label: "Recognition rate",   value: pct(DEMO_GOV_STATS.recognitionRate),       Icon: Target,       tone: "amber" },
  ] as const;

  const toneMap = {
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    navy: "text-[rgb(26_42_82)]",
  };

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {items.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 + i * 0.06, duration: 0.45 }}
          className="card-warm p-5"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-text-muted">
              {s.label}
            </span>
            <s.Icon className={cn("h-4 w-4", toneMap[s.tone])} />
          </div>
          <p
            className={cn(
              "mt-3 font-display text-[30px] font-bold leading-none tracking-tight tabular-nums",
              toneMap[s.tone]
            )}
          >
            {s.value}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

/* ───── 2. MOBILITY FLOWS ───── */

function MobilityFlows() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="card-warm rounded-3xl p-7"
    >
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
            Top Mobility Flows
          </p>
          <h2 className="mt-1.5 font-display text-[20px] font-bold tracking-tight text-text-primary">
            Source → Target institution pairs
          </h2>
        </div>
        <span className="hidden shrink-0 rounded-full border border-border-subtle px-3 py-1.5 text-[11px] font-medium text-text-secondary md:inline-flex">
          {DEMO_MOBILITY_FLOWS.length} pairs
        </span>
      </header>

      <div className="mt-6 grid grid-cols-[1fr_100px_1fr_90px] items-center gap-4 border-b border-border-subtle/60 pb-2.5">
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted">
          Source
        </span>
        <span />
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted">
          Target
        </span>
        <span className="text-right text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted">
          Students
        </span>
      </div>

      <ul className="divide-y divide-border-subtle/50">
        {DEMO_MOBILITY_FLOWS.map((flow, i) => (
          <motion.li
            key={`${flow.source}-${flow.target}`}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.04, duration: 0.4 }}
            className="grid grid-cols-[1fr_100px_1fr_90px] items-center gap-4 py-3.5 transition-colors hover:bg-canvas/40"
          >
            <p className="truncate text-[13px] font-medium text-text-primary">
              {flow.source}
            </p>

            <div className="flex flex-col items-center gap-1">
              <ArrowRight className="h-3.5 w-3.5 text-text-muted" />
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[9.5px] font-bold tabular-nums",
                  flow.recognition >= 0.85
                    ? "bg-emerald-100 text-emerald-800"
                    : flow.recognition >= 0.70
                    ? "bg-amber-100 text-amber-900"
                    : "bg-rose-100 text-rose-800"
                )}
              >
                {pct(flow.recognition)}
              </span>
            </div>

            <p className="truncate text-[13px] font-medium text-text-primary">
              {flow.target}
            </p>

            <p className="text-right font-mono text-[13px] font-semibold tabular-nums text-text-primary">
              {flow.students.toLocaleString("en-IN")}
            </p>
          </motion.li>
        ))}
      </ul>
    </motion.section>
  );
}

/* ───── 3. FRICTION HEATMAP ───── */

function FrictionHeatmap() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.5 }}
      className="card-warm flex h-full flex-col rounded-3xl p-7"
    >
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
          Friction Signals
        </p>
        <h2 className="mt-1.5 font-display text-[20px] font-bold tracking-tight text-text-primary">
          Courses by bridge rate
        </h2>
        <p className="mt-1.5 text-[12px] text-text-secondary">
          Higher bars = more students need a bridge before credit is recognized.
        </p>
      </header>

      <ul className="mt-6 flex-1 space-y-4">
        {DEMO_FRICTION_COURSES.map((c, i) => (
          <motion.li
            key={c.course}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45 + i * 0.04, duration: 0.4 }}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-[13px] font-semibold text-text-primary">
                {c.course}
              </p>
              <span className="font-mono text-[11px] tabular-nums text-text-muted">
                {c.decisions} decisions
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${c.bridgeRate * 100}%` }}
                transition={{
                  delay: 0.55 + i * 0.04,
                  duration: 0.75,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={cn(
                  "h-full rounded-full",
                  c.bridgeRate >= 0.6
                    ? "bg-rose-500"
                    : c.bridgeRate >= 0.3
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                )}
              />
            </div>
            <div className="mt-1 flex items-center justify-between text-[10.5px]">
              <span className="font-medium text-text-muted">
                Bridge {pct(c.bridgeRate)}
              </span>
              <span className="font-medium text-rose-600">
                Missing {pct(c.missingRate)}
              </span>
            </div>
          </motion.li>
        ))}
      </ul>
    </motion.section>
  );
}

/* ───── 4. TREND ───── */

function MobilityTrend() {
  const max = Math.max(...DEMO_MOBILITY_TREND.map((t) => t.decisions));

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="card-warm flex h-full flex-col rounded-3xl p-7"
    >
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
          Growth · 7 months
        </p>
        <h2 className="mt-1.5 font-display text-[20px] font-bold tracking-tight text-text-primary">
          Decisions volume
        </h2>
      </header>

      <div className="mt-8 flex-1">
        <div className="flex h-full items-end gap-3">
          {DEMO_MOBILITY_TREND.map((t, i) => {
            const h = (t.decisions / max) * 100;
            return (
              <div key={t.month} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full flex-1 items-end">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{
                      delay: 0.5 + i * 0.06,
                      duration: 0.8,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="w-full rounded-t-lg bg-gradient-to-t from-[rgb(26_42_82)] to-[rgb(51_76_148)]"
                    style={{ minHeight: "8px" }}
                  />
                </div>
                <span className="text-[10.5px] font-semibold uppercase tracking-wider text-text-muted">
                  {t.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between rounded-2xl bg-canvas/60 p-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-600" />
          <span className="text-[12px] font-semibold text-text-primary">
            +203% since March
          </span>
        </div>
        <span className="font-mono text-[11px] tabular-nums text-text-muted">
          {DEMO_MOBILITY_TREND[DEMO_MOBILITY_TREND.length - 1].decisions.toLocaleString("en-IN")} this month
        </span>
      </div>
    </motion.section>
  );
}

/* ───── 5. REGION SIGNALS ───── */

function RegionSignals() {
  const max = Math.max(...DEMO_REGION_SIGNALS.map((r) => r.students));

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.5 }}
      className="card-warm rounded-3xl p-7"
    >
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
          Regional Distribution
        </p>
        <h2 className="mt-1.5 font-display text-[20px] font-bold tracking-tight text-text-primary">
          Mobility by state
        </h2>
      </header>

      <ul className="mt-6 space-y-3">
        {DEMO_REGION_SIGNALS.map((r, i) => {
          const w = (r.students / max) * 100;
          return (
            <motion.li
              key={r.state}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 + i * 0.04, duration: 0.4 }}
              className="grid grid-cols-[140px_1fr_80px_60px] items-center gap-4"
            >
              <span className="text-[12.5px] font-semibold text-text-primary">
                {r.state}
              </span>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${w}%` }}
                  transition={{
                    delay: 0.65 + i * 0.04,
                    duration: 0.7,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="h-full rounded-full bg-[rgb(26_42_82)]/80"
                />
              </div>
              <span className="text-right font-mono text-[11.5px] font-semibold tabular-nums text-text-primary">
                {formatNum(r.students)}
              </span>
              <span
                className={cn(
                  "text-right font-mono text-[11px] font-semibold tabular-nums",
                  r.recognition >= 0.75
                    ? "text-emerald-700"
                    : r.recognition >= 0.65
                    ? "text-amber-700"
                    : "text-rose-700"
                )}
              >
                {pct(r.recognition)}
              </span>
            </motion.li>
          );
        })}
      </ul>
    </motion.section>
  );
}

/* ───── 6. POLICY SIGNALS ───── */

const SEVERITY_MAP: Record<
  PolicySignal["severity"],
  { bg: string; fg: string; Icon: typeof AlertTriangle; label: string }
> = {
  critical: {
    bg: "bg-rose-100",
    fg: "text-rose-800",
    Icon: ShieldAlert,
    label: "Critical",
  },
  attention: {
    bg: "bg-amber-100",
    fg: "text-amber-900",
    Icon: AlertTriangle,
    label: "Attention",
  },
  informational: {
    bg: "bg-emerald-100",
    fg: "text-emerald-800",
    Icon: Info,
    label: "Info",
  },
};

function PolicySignals() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="card-warm rounded-3xl p-7"
    >
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
          Policy Signals
        </p>
        <h2 className="mt-1.5 font-display text-[20px] font-bold tracking-tight text-text-primary">
          Auto-detected patterns
        </h2>
      </header>

      <ul className="mt-6 space-y-3">
        {DEMO_POLICY_SIGNALS.map((sig, i) => {
          const s = SEVERITY_MAP[sig.severity];
          const Icon = s.Icon;
          return (
            <motion.li
              key={sig.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.05, duration: 0.4 }}
              className="grid grid-cols-[auto_1fr_auto] items-start gap-4 rounded-2xl border border-border-subtle bg-white/70 p-5 transition-all hover:border-emerald-200 hover:shadow-sm"
            >
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                  s.bg
                )}
              >
                <Icon className={cn("h-4 w-4", s.fg)} />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider",
                      s.bg,
                      s.fg
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                <p className="mt-1.5 text-[14px] font-semibold leading-snug tracking-tight text-text-primary">
                  {sig.title}
                </p>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-text-secondary">
                  {sig.description}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-mono text-[16px] font-bold tabular-nums text-text-primary">
                  {sig.affectedInstitutions}
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                  HEIs
                </p>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </motion.section>
  );
}

/* ───── 7. SYSTEM HEALTH ───── */

function SystemHealth() {
  const rows = [
    { label: "API p50", value: DEMO_LATENCY_STATS.apiP50, tone: "emerald" },
    { label: "API p95", value: DEMO_LATENCY_STATS.apiP95, tone: "emerald" },
    { label: "Solver p50", value: DEMO_LATENCY_STATS.solverP50, tone: "emerald" },
    { label: "Solver p95", value: DEMO_LATENCY_STATS.solverP95, tone: "amber" },
    { label: "Solver p99", value: DEMO_LATENCY_STATS.solverP99, tone: "rose" },
    { label: "LLM p50", value: DEMO_LATENCY_STATS.llmP50, tone: "emerald" },
    { label: "LLM p95", value: DEMO_LATENCY_STATS.llmP95, tone: "amber" },
    { label: "Cache hit", value: pct(DEMO_LATENCY_STATS.cacheHitRate), tone: "emerald" },
  ] as const;

  const toneMap = {
    emerald: "text-emerald-700",
    amber: "text-amber-700",
    rose: "text-rose-700",
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55, duration: 0.5 }}
      className="card-warm rounded-3xl p-7"
    >
      <header className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
          <Activity className="h-4 w-4 text-emerald-700" />
        </span>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
            Platform Health
          </p>
          <h2 className="font-display text-[17px] font-bold tracking-tight text-text-primary">
            Live latency & cache
          </h2>
        </div>
      </header>

      <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex items-center justify-between border-b border-border-subtle/50 pb-2.5 last:border-0"
          >
            <dt className="text-[12px] font-medium text-text-secondary">
              {r.label}
            </dt>
            <dd
              className={cn(
                "font-mono text-[12.5px] font-semibold tabular-nums",
                toneMap[r.tone]
              )}
            >
              {r.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 flex items-center gap-2 rounded-2xl bg-emerald-50/60 p-4">
        <Zap className="h-4 w-4 text-emerald-700" />
        <p className="text-[12px] font-medium text-emerald-900">
          All systems nominal ·{" "}
          <span className="font-semibold">100% chain integrity</span>
        </p>
      </div>
    </motion.section>
  );
}

/* ───── MAIN ───── */

export function MobilityIntelligence() {
  return (
    <div className="space-y-5">
      <HeroStats />

      <MobilityFlows />

      <div className="grid gap-5 lg:grid-cols-2">
        <FrictionHeatmap />
        <MobilityTrend />
      </div>

      <RegionSignals />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <PolicySignals />
        <SystemHealth />
      </div>
    </div>
  );
}