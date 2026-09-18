"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Route,
  Users,
  Target,
  BarChart3,
  ShieldCheck,
  MapPin,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { BottomStrip } from "@/components/layout/BottomStrip";
import { GOV_NAV } from "@/components/layout/Sidebar";
import {
  DEMO_SANKEY_NODES,
  DEMO_SANKEY_LINKS,
  DEMO_COHORT_BREAKDOWN,
  DEMO_REGIONAL_MONTHLY,
  DEMO_CHANNEL_METRICS,
} from "@/lib/constants/demo-gov-mobility";
import { DEMO_CHAIN } from "@/lib/constants/demo";
import { cn } from "@/lib/utils/cn";

/* ───── helpers ───── */

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

/* ───── 1. METRICS ROW ───── */

function MetricsRow() {
  const toneMap = {
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    rose: "text-rose-600",
    navy: "text-[rgb(26_42_82)]",
  };

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {DEMO_CHANNEL_METRICS.map((m, i) => {
        const Trend = m.trend >= 0 ? TrendingUp : TrendingDown;
        const trendColor = m.trend >= 0 ? "text-emerald-600" : "text-rose-600";
        return (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.06, duration: 0.45 }}
            className="card-warm p-5"
          >
            <p className="text-[10.5px] font-bold uppercase tracking-wider text-text-muted">
              {m.label}
            </p>
            <div className="mt-3 flex items-baseline justify-between gap-2">
              <p className={cn("font-display text-[22px] font-bold leading-none tracking-tight tabular-nums", toneMap[m.tone])}>
                {m.value}
              </p>
              <span className={cn("inline-flex items-center gap-0.5 text-[11px] font-bold tabular-nums", trendColor)}>
                <Trend className="h-3 w-3" />
                {Math.abs(m.trend)}%
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ───── 2. SANKEY FLOW DIAGRAM ───── */

function SankeyDiagram() {
  const sourceNodes = DEMO_SANKEY_NODES.filter((n) => n.type === "source");
  const targetNodes = DEMO_SANKEY_NODES.filter((n) => n.type === "target");
  const totalSource = sourceNodes.reduce((s, n) => s + n.students, 0);
  const totalTarget = targetNodes.reduce((s, n) => s + n.students, 0);

  const SRC_LEFT = 240;   // source bars x-position (leaves room for source labels on left)
  const SRC_WIDTH = 12;
  const TGT_LEFT = 760;   // target bars x-position
  const TGT_WIDTH = 12;
  const SVG_W = 1000;     // total SVG width (target labels fit on the right)
  const TOP_PADDING = 24;

  // Source node y positions (stacked proportional to student count)
  const srcPositions: Record<string, { y: number; h: number }> = {};
  let srcCursor = TOP_PADDING;
  sourceNodes.forEach((n) => {
    const h = (n.students / totalSource) * 260;
    srcPositions[n.id] = { y: srcCursor, h };
    srcCursor += h + 12;
  });

  // Target node y positions
  const tgtPositions: Record<string, { y: number; h: number }> = {};
  let tgtCursor = TOP_PADDING;
  targetNodes.forEach((n) => {
    const h = (n.students / totalTarget) * 260;
    tgtPositions[n.id] = { y: tgtCursor, h };
    tgtCursor += h + 12;
  });

  const SVG_H = Math.max(srcCursor, tgtCursor) + 24;

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.5 }}
      className="card-warm overflow-hidden rounded-3xl p-7"
    >
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
          Flow Diagram
        </p>
        <h2 className="mt-1.5 font-display text-[20px] font-bold tracking-tight text-text-primary">
          Source → Target mobility
        </h2>
        <p className="mt-1.5 text-[12px] text-text-secondary">
          Stroke thickness = students. Color = recognition quality.
        </p>
      </header>

      <div className="mt-6 overflow-x-auto">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="h-auto w-full min-w-[900px]"
          role="img"
          aria-label="Mobility flow diagram"
        >
          {/* Links */}
          {DEMO_SANKEY_LINKS.map((link, i) => {
            const src = srcPositions[link.source];
            const tgt = tgtPositions[link.target];
            if (!src || !tgt) return null;

            const x1 = SRC_LEFT + SRC_WIDTH;
            const y1 = src.y + src.h / 2;
            const x2 = TGT_LEFT;
            const y2 = tgt.y + tgt.h / 2;
            const cx = (x1 + x2) / 2;

            const color =
              link.recognition >= 0.85
                ? "rgb(16 185 129)"
                : link.recognition >= 0.7
                ? "rgb(245 158 11)"
                : "rgb(244 63 94)";

            const strokeW = Math.max(4, (link.students / totalSource) * 22);

            return (
              <motion.path
                key={i}
                d={`M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`}
                fill="none"
                stroke={color}
                strokeWidth={strokeW}
                strokeLinecap="round"
                opacity={0.4}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.4 }}
                transition={{
                  delay: 0.5 + i * 0.06,
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                }}
              />
            );
          })}

          {/* Source nodes + labels (labels on the LEFT of the bar) */}
          {sourceNodes.map((n, i) => {
            const pos = srcPositions[n.id];
            return (
              <motion.g
                key={n.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.05, duration: 0.4 }}
              >
                <rect
                  x={SRC_LEFT}
                  y={pos.y}
                  width={SRC_WIDTH}
                  height={pos.h}
                  rx={5}
                  fill="rgb(26 42 82)"
                />
                <text
                  x={SRC_LEFT - 14}
                  y={pos.y + pos.h / 2 + 4}
                  textAnchor="end"
                  style={{
  fontSize: 12,
  fontWeight: 600,
  fill: "currentColor",
}}
className="text-text-primary"
                >
                  {n.label}
                </text>
              </motion.g>
            );
          })}

          {/* Target nodes + labels (labels on the RIGHT of the bar) */}
          {targetNodes.map((n, i) => {
            const pos = tgtPositions[n.id];
            return (
              <motion.g
                key={n.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 + i * 0.05, duration: 0.4 }}
              >
                <rect
                  x={TGT_LEFT}
                  y={pos.y}
                  width={TGT_WIDTH}
                  height={pos.h}
                  rx={5}
                  fill="rgb(16 185 129)"
                />
                <text
                  x={TGT_LEFT + TGT_WIDTH + 14}
                  y={pos.y + pos.h / 2 + 4}
                  textAnchor="start"
                  style={{
  fontSize: 12,
  fontWeight: 600,
  fill: "currentColor",
}}
className="text-text-primary"
                >
                  {n.label}
                </text>
              </motion.g>
            );
          })}
        </svg>
      </div>
    </motion.section>
  );
}

/* ───── 3. COHORT BREAKDOWN ───── */

function CohortBreakdown() {
  const tones = {
    direct: "bg-emerald-500",
    bridge: "bg-amber-500",
    missing: "bg-rose-500",
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="card-warm rounded-3xl p-7"
    >
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
          Cohort Analysis
        </p>
        <h2 className="mt-1.5 font-display text-[20px] font-bold tracking-tight text-text-primary">
          Recognition by discipline
        </h2>
      </header>

      <ul className="mt-6 space-y-4">
        {DEMO_COHORT_BREAKDOWN.map((c, i) => {
          const total = c.direct + c.bridge + c.missing;
          return (
            <motion.li
              key={c.label}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.05, duration: 0.4 }}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13px] font-semibold text-text-primary">
                  {c.label}
                </span>
                <span className="font-mono text-[11px] tabular-nums text-text-muted">
                  {total} students
                </span>
              </div>
              <div className="mt-2 flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(c.direct / total) * 100}%` }}
                  transition={{ delay: 0.55 + i * 0.05, duration: 0.6 }}
                  className={tones.direct}
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(c.bridge / total) * 100}%` }}
                  transition={{ delay: 0.6 + i * 0.05, duration: 0.6 }}
                  className={tones.bridge}
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(c.missing / total) * 100}%` }}
                  transition={{ delay: 0.65 + i * 0.05, duration: 0.6 }}
                  className={tones.missing}
                />
              </div>
              <div className="mt-1 flex items-center justify-between text-[10.5px] font-medium">
                <span className="text-emerald-700">Direct {pct(c.direct / total)}</span>
                <span className="text-amber-700">Bridge {pct(c.bridge / total)}</span>
                <span className="text-rose-700">Missing {pct(c.missing / total)}</span>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </motion.section>
  );
}

/* ───── 4. REGIONAL MONTHLY ───── */

function RegionalMonthly() {
  const keys = ["bengaluru", "mumbai", "delhi", "chennai"] as const;
  const colors = {
    bengaluru: "bg-emerald-500",
    mumbai: "bg-[rgb(26_42_82)]",
    delhi: "bg-amber-500",
    chennai: "bg-sky-500",
  };
  const max = Math.max(
    ...DEMO_REGIONAL_MONTHLY.flatMap((m) => keys.map((k) => m[k]))
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.5 }}
      className="card-warm rounded-3xl p-7"
    >
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
            Regional Cohorts
          </p>
          <h2 className="mt-1.5 font-display text-[20px] font-bold tracking-tight text-text-primary">
            Monthly mobility by metro
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-text-secondary">
          {keys.map((k) => (
            <span key={k} className="inline-flex items-center gap-1.5">
              <span className={cn("h-2 w-2 rounded-full", colors[k])} />
              <span className="capitalize">{k}</span>
            </span>
          ))}
        </div>
      </header>

      <div className="mt-8 flex items-end gap-4 h-48">
        {DEMO_REGIONAL_MONTHLY.map((m, i) => (
          <div key={m.month} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-full w-full items-end justify-center gap-1">
              {keys.map((k) => (
                <motion.div
                  key={k}
                  initial={{ height: 0 }}
                  animate={{ height: `${(m[k] / max) * 100}%` }}
                  transition={{ delay: 0.6 + i * 0.05 + keys.indexOf(k) * 0.02, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className={cn("w-2 rounded-t-md", colors[k])}
                />
              ))}
            </div>
            <span className="text-[10.5px] font-semibold uppercase tracking-wider text-text-muted">
              {m.month}
            </span>
          </div>
        ))}
      </div>
    </motion.section>
  );
}

/* ───── MAIN ───── */

export default function GovMobilityPage() {
  const topBarRight = (
    <>
      <span className="pill hidden lg:inline-flex">
        <span className="font-semibold text-text-primary">
          Ministry / Nodal Officer
        </span>
        <span className="text-text-muted">·</span>
        <span>National View</span>
      </span>
      <span className="pill hidden md:inline-flex">
        Chain ID: {DEMO_CHAIN.id}
      </span>
      <span className="relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-50 to-emerald-100 px-3.5 py-2 text-[11px] font-semibold text-emerald-800 shadow-sm">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <ShieldCheck className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Chain Integrity:</span>
        <span>{DEMO_CHAIN.integrity}</span>
      </span>
    </>
  );

  return (
    <AppShell
      title="Mobility Intelligence"
      subtitle="Deep-dive: source-target flows, cohorts, and regional distribution"
      topBarRight={topBarRight}
      nav={GOV_NAV}
      reserveBottom
    >
      <section className="mx-auto max-w-[1500px] px-4 pb-4 pt-4 md:px-6">
        <motion.header
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 max-w-3xl"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgb(26_42_82)] text-white">
              <Route className="h-5 w-5" />
            </span>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-700">
              Ministry Access · Read-only · National scale
            </p>
          </div>
          <h1 className="mt-4 font-display text-[32px] font-bold leading-tight tracking-tighter text-[rgb(26_42_82)] md:text-[38px]">
            Mobility deep-dive
          </h1>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-text-secondary">
            Source-to-target flow analysis, discipline-level cohorts, and
            regional trends. All signals derived from tamper-evident audit
            ledgers. No PII, no cross-institution identification.
          </p>
        </motion.header>

        <div className="space-y-5">
          <MetricsRow />
          <SankeyDiagram />
          <div className="grid gap-5 lg:grid-cols-2">
            <CohortBreakdown />
            <RegionalMonthly />
          </div>
        </div>
      </section>

      <BottomStrip
        label={"Flow\nVolume"}
        statusTitle="4,936 students transferred this month · avg recognition 78%"
        statusIcon={<Users className="h-4 w-4" />}
        ctaLabel="Export flow data"
      />
    </AppShell>
  );
}