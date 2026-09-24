"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Route,
  Users,
  ShieldCheck,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { BottomStrip } from "@/components/layout/BottomStrip";
import { TableSkeleton } from "@/components/feedback/Skeleton";
import { GOV_NAV } from "@/components/layout/Sidebar";
import { useRequireRole } from "@/lib/hooks/useRequireRole";
import { useGovMobility, useGovAggregate } from "@/lib/api/hooks";
import type { SankeyNode, SankeyLink, FrictionCourse, RegionSignal } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";

/* ───── helpers ───── */

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

/* ───── 1. METRICS ROW ───── */

function MetricsRow({
  stats,
  trend,
}: {
  stats: { totalStudents: number; heisIntegrated: number; totalDecisions: number; recognitionRate: number };
  trend: { month: string; decisions: number; recognition: number }[];
}) {
  const last = trend[trend.length - 1];
  const prev = trend[trend.length - 2];
  const decisionsDelta = last && prev && prev.decisions > 0 ? Math.round(((last.decisions - prev.decisions) / prev.decisions) * 100) : null;
  const recognitionDelta = last && prev ? Math.round((last.recognition - prev.recognition) * 100) : null;

  const items = [
    { label: "Students tracked", value: stats.totalStudents.toLocaleString("en-IN"), delta: null },
    { label: "HEIs integrated", value: stats.heisIntegrated.toLocaleString("en-IN"), delta: null },
    { label: "Total decisions", value: stats.totalDecisions.toLocaleString("en-IN"), delta: decisionsDelta },
    { label: "Recognition rate", value: pct(stats.recognitionRate), delta: recognitionDelta },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {items.map((m, i) => {
        const Trend = (m.delta ?? 0) >= 0 ? TrendingUp : TrendingDown;
        const trendColor = (m.delta ?? 0) >= 0 ? "text-emerald-600" : "text-rose-600";
        return (
          <motion.div key={m.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.06, duration: 0.45 }} className="card-warm p-5">
            <p className="text-[10.5px] font-bold uppercase tracking-wider text-text-muted">{m.label}</p>
            <div className="mt-3 flex items-baseline justify-between gap-2">
              <p className="font-display text-[22px] font-bold leading-none tracking-tight tabular-nums text-[rgb(26_42_82)]">{m.value}</p>
              {m.delta !== null && (
                <span className={cn("inline-flex items-center gap-0.5 text-[11px] font-bold tabular-nums", trendColor)}>
                  <Trend className="h-3 w-3" />
                  {Math.abs(m.delta)}%
                </span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ───── 2. SANKEY FLOW DIAGRAM ───── */

function SankeyDiagram({ nodes, links }: { nodes: SankeyNode[]; links: SankeyLink[] }) {
  const sourceNodes = nodes.filter((n) => n.type === "source");
  const targetNodes = nodes.filter((n) => n.type === "target");
  const totalSource = sourceNodes.reduce((s, n) => s + n.students, 0) || 1;
  const totalTarget = targetNodes.reduce((s, n) => s + n.students, 0) || 1;

  const SRC_LEFT = 240;
  const SRC_WIDTH = 12;
  const TGT_LEFT = 760;
  const TGT_WIDTH = 12;
  const SVG_W = 1000;
  const TOP_PADDING = 24;

  const srcPositions: Record<string, { y: number; h: number }> = {};
  let srcCursor = TOP_PADDING;
  sourceNodes.forEach((n) => {
    const h = (n.students / totalSource) * 260;
    srcPositions[n.id] = { y: srcCursor, h };
    srcCursor += h + 12;
  });

  const tgtPositions: Record<string, { y: number; h: number }> = {};
  let tgtCursor = TOP_PADDING;
  targetNodes.forEach((n) => {
    const h = (n.students / totalTarget) * 260;
    tgtPositions[n.id] = { y: tgtCursor, h };
    tgtCursor += h + 12;
  });

  const SVG_H = Math.max(srcCursor, tgtCursor, 120) + 24;

  return (
    <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.5 }} className="card-warm overflow-hidden rounded-3xl p-7">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">Flow Diagram</p>
        <h2 className="mt-1.5 font-display text-[20px] font-bold tracking-tight text-text-primary">Source → Target mobility</h2>
        <p className="mt-1.5 text-[12px] text-text-secondary">Stroke thickness = students. Color = recognition quality.</p>
      </header>

      {nodes.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border-subtle py-12 text-center">
          <Route className="h-6 w-6 text-text-muted" />
          <p className="text-[13px] font-semibold text-text-primary">No cross-institution transfers recorded yet</p>
          <p className="max-w-xs text-[11.5px] text-text-secondary">The flow diagram populates once recognition decisions exist across more than one institution.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="h-auto w-full min-w-[900px]" role="img" aria-label="Mobility flow diagram">
            {links.map((link, i) => {
              const src = srcPositions[link.source];
              const tgt = tgtPositions[link.target];
              if (!src || !tgt) return null;

              const x1 = SRC_LEFT + SRC_WIDTH;
              const y1 = src.y + src.h / 2;
              const x2 = TGT_LEFT;
              const y2 = tgt.y + tgt.h / 2;
              const cx = (x1 + x2) / 2;

              const color = link.recognition >= 0.85 ? "rgb(16 185 129)" : link.recognition >= 0.7 ? "rgb(245 158 11)" : "rgb(244 63 94)";
              const strokeW = Math.max(4, (link.students / totalSource) * 22);

              return (
                <motion.path
                  key={`${link.source}-${link.target}-${i}`}
                  d={`M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`}
                  fill="none"
                  stroke={color}
                  strokeWidth={strokeW}
                  strokeLinecap="round"
                  opacity={0.4}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.4 }}
                  transition={{ delay: 0.5 + i * 0.06, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                />
              );
            })}

            {sourceNodes.map((n, i) => {
              const pos = srcPositions[n.id];
              return (
                <motion.g key={n.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.05, duration: 0.4 }}>
                  <rect x={SRC_LEFT} y={pos.y} width={SRC_WIDTH} height={pos.h} rx={5} fill="rgb(26 42 82)" />
                  <text x={SRC_LEFT - 14} y={pos.y + pos.h / 2 + 4} textAnchor="end" style={{ fontSize: 12, fontWeight: 600, fill: "currentColor" }} className="text-text-primary">
                    {n.label}
                  </text>
                </motion.g>
              );
            })}

            {targetNodes.map((n, i) => {
              const pos = tgtPositions[n.id];
              return (
                <motion.g key={n.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 + i * 0.05, duration: 0.4 }}>
                  <rect x={TGT_LEFT} y={pos.y} width={TGT_WIDTH} height={pos.h} rx={5} fill="rgb(16 185 129)" />
                  <text x={TGT_LEFT + TGT_WIDTH + 14} y={pos.y + pos.h / 2 + 4} style={{ fontSize: 12, fontWeight: 600, fill: "currentColor" }} className="text-text-primary">
                    {n.label}
                  </text>
                </motion.g>
              );
            })}
          </svg>
        </div>
      )}
    </motion.section>
  );
}

/* ───── 3. FRICTION BY COURSE ───── */

function FrictionByCourse({ courses }: { courses: FrictionCourse[] }) {
  const top = [...courses].sort((a, b) => b.bridgeRate + b.missingRate - (a.bridgeRate + a.missingRate)).slice(0, 8);

  return (
    <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }} className="card-warm rounded-3xl p-7">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">Recognition Friction</p>
        <h2 className="mt-1.5 font-display text-[20px] font-bold tracking-tight text-text-primary">Highest-friction target courses</h2>
      </header>

      {top.length === 0 ? (
        <p className="mt-5 text-[12.5px] text-text-secondary">No recognition decisions recorded yet.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {top.map((c, i) => {
            const direct = Math.max(0, 1 - c.bridgeRate - c.missingRate);
            return (
              <motion.li key={c.course} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.05, duration: 0.4 }}>
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate text-[13px] font-semibold text-text-primary">{c.course}</span>
                  <span className="font-mono text-[11px] tabular-nums text-text-muted">{c.decisions} decisions</span>
                </div>
                <div className="mt-2 flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${direct * 100}%` }} transition={{ delay: 0.55 + i * 0.05, duration: 0.6 }} className="bg-emerald-500" />
                  <motion.div initial={{ width: 0 }} animate={{ width: `${c.bridgeRate * 100}%` }} transition={{ delay: 0.6 + i * 0.05, duration: 0.6 }} className="bg-amber-500" />
                  <motion.div initial={{ width: 0 }} animate={{ width: `${c.missingRate * 100}%` }} transition={{ delay: 0.65 + i * 0.05, duration: 0.6 }} className="bg-rose-500" />
                </div>
                <div className="mt-1 flex items-center justify-between text-[10.5px] font-medium">
                  <span className="text-emerald-700">Direct {pct(direct)}</span>
                  <span className="text-amber-700">Bridge {pct(c.bridgeRate)}</span>
                  <span className="text-rose-700">Missing {pct(c.missingRate)}</span>
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}
    </motion.section>
  );
}

/* ───── 4. REGIONAL DISTRIBUTION ───── */

function RegionalDistribution({ regions }: { regions: RegionSignal[] }) {
  const sorted = [...regions].sort((a, b) => b.students - a.students).slice(0, 10);
  const max = Math.max(...sorted.map((r) => r.students), 1);

  return (
    <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.5 }} className="card-warm rounded-3xl p-7">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">Regional Signals</p>
        <h2 className="mt-1.5 font-display text-[20px] font-bold tracking-tight text-text-primary">Distribution by state</h2>
      </header>

      {sorted.length === 0 ? (
        <p className="mt-5 text-[12.5px] text-text-secondary">No regional data yet.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {sorted.map((r, i) => (
            <motion.li key={r.state} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.04, duration: 0.4 }} className="flex items-center gap-3">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-text-muted" />
              <span className="w-28 shrink-0 truncate text-[12.5px] font-semibold text-text-primary">{r.state}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                <motion.div initial={{ width: 0 }} animate={{ width: `${(r.students / max) * 100}%` }} transition={{ delay: 0.55 + i * 0.04, duration: 0.6 }} className="h-full rounded-full bg-[rgb(26_42_82)]" />
              </div>
              <span className="w-14 shrink-0 text-right font-mono text-[11.5px] tabular-nums text-text-secondary">{r.students}</span>
              <span className="w-16 shrink-0 text-right font-mono text-[11px] tabular-nums text-text-muted">{r.heis} HEIs</span>
            </motion.li>
          ))}
        </ul>
      )}
    </motion.section>
  );
}

/* ───── MAIN ───── */

export default function GovMobilityPage() {
  const session = useRequireRole("ministry");
  const mobility = useGovMobility();
  const aggregate = useGovAggregate();

  if (!session) return null;

  const topBarRight = (
    <>
      <span className="pill hidden lg:inline-flex">
        <span className="font-semibold text-text-primary">Ministry / Nodal Officer</span>
        <span className="text-text-muted">·</span>
        <span>{session.displayName}</span>
      </span>
      {aggregate.data && (
        <span className="relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-50 to-emerald-100 px-3.5 py-2 text-[11px] font-semibold text-emerald-800 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>{aggregate.data.stats.heisIntegrated} HEIs integrated</span>
        </span>
      )}
    </>
  );

  const isLoading = mobility.isLoading || aggregate.isLoading;
  const isError = mobility.isError || aggregate.isError;

  return (
    <AppShell title="Mobility Intelligence" subtitle="Deep-dive: source-target flows, friction, and regional distribution" topBarRight={topBarRight} nav={GOV_NAV} reserveBottom>
      <section className="mx-auto max-w-[1500px] px-4 pb-4 pt-4 md:px-6">
        <motion.header initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="mb-6 max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgb(26_42_82)] text-white">
              <Route className="h-5 w-5" />
            </span>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-700">Ministry Access · Read-only · National scale</p>
          </div>
          <h1 className="mt-4 font-display text-[32px] font-bold leading-tight tracking-tighter text-[rgb(26_42_82)] md:text-[38px]">Mobility deep-dive</h1>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-text-secondary">
            Source-to-target flow analysis, course-level friction, and regional distribution — aggregated from the tamper-evident audit ledger. No PII, no cross-institution identification.
          </p>
        </motion.header>

        {isLoading ? (
          <div className="space-y-5">
            <TableSkeleton rows={4} />
          </div>
        ) : isError ? (
          <div className="card-warm rounded-3xl p-8 text-center">
            <AlertTriangle className="mx-auto h-6 w-6 text-amber-600" />
            <p className="mt-2 text-[14px] font-semibold text-text-primary">We couldn't load mobility analytics.</p>
            <p className="mt-2 text-[12.5px] text-text-secondary">Try refreshing the page.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {aggregate.data && <MetricsRow stats={aggregate.data.stats} trend={aggregate.data.trend} />}
            {mobility.data && <SankeyDiagram nodes={mobility.data.nodes} links={mobility.data.links} />}
            {aggregate.data && (
              <div className="grid gap-5 lg:grid-cols-2">
                <FrictionByCourse courses={aggregate.data.frictionCourses} />
                <RegionalDistribution regions={aggregate.data.regionSignals} />
              </div>
            )}
          </div>
        )}
      </section>

      <BottomStrip
        label={"Flow\nVolume"}
        statusTitle={
          aggregate.data
            ? `${aggregate.data.stats.totalStudents.toLocaleString("en-IN")} students tracked · ${pct(aggregate.data.stats.recognitionRate)} avg recognition`
            : "Loading mobility signals…"
        }
        statusIcon={<Users className="h-4 w-4" />}
        ctaLabel="Export flow data"
      />
    </AppShell>
  );
}
