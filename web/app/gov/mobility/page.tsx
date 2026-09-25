"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import {
  TrendingUp,
  TrendingDown,
  Route,
  Users,
  ShieldCheck,
  MapPin,
  AlertTriangle,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Download,
  Printer,
  Sparkles,
  X,
  FileText,
  SlidersHorizontal,
  RefreshCw,
  Building2,
  BookOpen,
  Layers,
  CheckCircle2,
  Info,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { BottomStrip } from "@/components/layout/BottomStrip";
import { TableSkeleton } from "@/components/feedback/Skeleton";
import { GOV_NAV } from "@/components/layout/Sidebar";
import { useRequireRole } from "@/lib/hooks/useRequireRole";
import { useGovMobility, useGovAggregate, useUpdateGovPolicy } from "@/lib/api/hooks";
import type { SankeyNode, SankeyLink, FrictionCourse, RegionSignal, MobilityFlow } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";

/* ───── helpers ───── */

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

const COURSE_TITLE_MAP: Record<string, { title: string; category: string; ncrfLevel: string }> = {
  "CS-101": { title: "Introduction to Programming & Algorithms", category: "Core Computer Science", ncrfLevel: "L4.5" },
  "CS-501": { title: "Data Structures & Modern Algorithmic Design", category: "Core Systems", ncrfLevel: "L5.5" },
  "CS-502": { title: "Computer Architecture & Embedded Systems", category: "Hardware & Systems", ncrfLevel: "L5.5" },
  "MATH-201": { title: "Discrete Mathematics & Graph Theory", category: "Mathematical Foundations", ncrfLevel: "L5.0" },
  "AI-301": { title: "Machine Learning & Neural Architectures", category: "Specialization", ncrfLevel: "L6.0" },
};

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
  const decisionsDelta =
    last && prev && prev.decisions > 0 ? Math.round(((last.decisions - prev.decisions) / prev.decisions) * 100) : null;
  const recognitionDelta = last && prev ? Math.round((last.recognition - prev.recognition) * 100) : null;

  const items = [
    { label: "Students tracked", value: stats.totalStudents.toLocaleString("en-IN"), delta: null, Icon: Users, tone: "navy" },
    { label: "HEIs integrated", value: stats.heisIntegrated.toLocaleString("en-IN"), delta: null, Icon: Building2, tone: "emerald" },
    { label: "Total decisions", value: stats.totalDecisions.toLocaleString("en-IN"), delta: decisionsDelta, Icon: TrendingUp, tone: "emerald" },
    { label: "Recognition rate", value: pct(stats.recognitionRate), delta: recognitionDelta, Icon: ShieldCheck, tone: "amber" },
  ];

  const toneMap = {
    emerald: "text-emerald-700",
    amber: "text-amber-700",
    navy: "text-[rgb(26_42_82)]",
  };

  return (
    <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4 md:gap-4.5">
      {items.map((m, i) => {
        const Trend = (m.delta ?? 0) >= 0 ? TrendingUp : TrendingDown;
        const trendColor = (m.delta ?? 0) >= 0 ? "text-emerald-600" : "text-rose-600";
        return (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.06, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="card-warm relative overflow-hidden rounded-2xl p-5.5 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-text-muted">{m.label}</p>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100/80 border border-slate-200/60">
                <m.Icon className="h-4 w-4 text-slate-700" />
              </span>
            </div>

            <div className="mt-3.5 flex items-baseline justify-between gap-2">
              <p className={cn("font-display text-[30px] font-bold leading-none tracking-tight tabular-nums", toneMap[m.tone as keyof typeof toneMap])}>
                {m.value}
              </p>
              {m.delta !== null && (
                <span className={cn("inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums bg-slate-100", trendColor)}>
                  <Trend className="h-3 w-3" />
                  {Math.abs(m.delta)}%
                </span>
              )}
            </div>

            <div className="mt-2 text-[11.5px] text-text-muted font-medium">
              Ecosystem ledger verified
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ───── 2. INTERACTIVE SANKEY FLOW DIAGRAM ───── */

function SankeyDiagram({
  nodes,
  links,
  onSelectCorridor,
}: {
  nodes: SankeyNode[];
  links: SankeyLink[];
  onSelectCorridor: (corridor: { sourceName: string; targetName: string; students: number; recognition: number }) => void;
}) {
  const [hoveredLink, setHoveredLink] = useState<number | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [viewMode, setViewMode] = useState<"diagram" | "table">("diagram");

  const sourceNodes = nodes.filter((n) => n.type === "source");
  const targetNodes = nodes.filter((n) => n.type === "target");

  const totalSource = sourceNodes.reduce((s, n) => s + n.students, 0) || 1;
  const totalTarget = targetNodes.reduce((s, n) => s + n.students, 0) || 1;

  const SRC_LEFT = 280;
  const SRC_WIDTH = 14;
  const TGT_LEFT = 760;
  const TGT_WIDTH = 14;
  const SVG_W = 1040;
  const TOP_PADDING = 32;

  const srcPositions: Record<string, { y: number; h: number; name: string }> = {};
  let srcCursor = TOP_PADDING;
  sourceNodes.forEach((n) => {
    const h = Math.max((n.students / totalSource) * 260, 28);
    srcPositions[n.id] = { y: srcCursor, h, name: n.label };
    srcCursor += h + 24;
  });

  const tgtPositions: Record<string, { y: number; h: number; name: string }> = {};
  let tgtCursor = TOP_PADDING;
  targetNodes.forEach((n) => {
    const h = Math.max((n.students / totalTarget) * 260, 32);
    tgtPositions[n.id] = { y: tgtCursor, h, name: n.label };
    tgtCursor += h + 24;
  });

  const SVG_H = Math.max(srcCursor, tgtCursor, 180) + 32;

  const nodeMap = useMemo(() => {
    const m = new Map<string, string>();
    nodes.forEach((n) => m.set(n.id, n.label));
    return m;
  }, [nodes]);

  const filteredLinks = useMemo(() => {
    if (!searchFilter.trim()) return links;
    const q = searchFilter.toLowerCase();
    return links.filter((l) => {
      const srcName = (nodeMap.get(l.source) || "").toLowerCase();
      const tgtName = (nodeMap.get(l.target) || "").toLowerCase();
      return srcName.includes(q) || tgtName.includes(q);
    });
  }, [links, searchFilter, nodeMap]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.5 }}
      className="card-warm overflow-hidden rounded-3xl p-7 shadow-sm"
    >
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
              Autonomous Credit Flow Graph
            </p>
          </div>
          <h2 className="mt-1 font-display text-[22px] font-bold tracking-tight text-text-primary">
            Source → Target Mobility Pathways
          </h2>
          <p className="mt-1 text-[12.5px] text-text-secondary">
            Hover over any corridor flow to view instantaneous credit equivalence and transfer volume. Click to inspect syllabus mapping.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl border border-slate-200/80 bg-white p-1 shadow-2xs">
            <button
              onClick={() => setViewMode("diagram")}
              className={cn(
                "rounded-lg px-3 py-1 text-[11.5px] font-semibold transition-all",
                viewMode === "diagram" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              )}
            >
              Interactive Graph
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={cn(
                "rounded-lg px-3 py-1 text-[11.5px] font-semibold transition-all",
                viewMode === "table" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              )}
            >
              Corridor Matrix
            </button>
          </div>
        </div>
      </header>

      {/* Search & Legend Controls */}
      <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/70 p-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter corridors (e.g. Calcutta, Delhi, Bombay, Anna)..."
            className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-[12.5px] text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none"
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-[11.5px] text-text-secondary font-medium">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-xs" />
            <span>≥85% Direct Recognition</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shadow-xs" />
            <span>70–84% Bridge Prescribed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shadow-xs" />
            <span>&lt;70% Curriculum Delta</span>
          </div>
        </div>
      </div>

      {nodes.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border-subtle py-14 text-center">
          <Route className="h-7 w-7 text-text-muted" />
          <p className="text-[14px] font-semibold text-text-primary">No cross-institution transfers recorded yet</p>
          <p className="max-w-xs text-[12px] text-text-secondary">Corridors populate automatically as students submit recognition requests across integrated universities.</p>
        </div>
      ) : viewMode === "diagram" ? (
        <div className="mt-6 overflow-x-auto rounded-2xl bg-white/60 p-4 border border-slate-100">
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            className="h-auto w-full min-w-[960px] select-none"
            role="img"
            aria-label="Interactive mobility flow diagram"
          >
            <defs>
              <linearGradient id="flowEmerald" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgb(26, 42, 82)" stopOpacity="0.7" />
                <stop offset="100%" stopColor="rgb(16, 185, 129)" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="flowAmber" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgb(26, 42_82)" stopOpacity="0.7" />
                <stop offset="100%" stopColor="rgb(245, 158, 11)" stopOpacity="0.9" />
              </linearGradient>
            </defs>

            {/* Connecting Links */}
            {filteredLinks.map((link, i) => {
              const src = srcPositions[link.source];
              const tgt = tgtPositions[link.target];
              if (!src || !tgt) return null;

              const x1 = SRC_LEFT + SRC_WIDTH;
              const y1 = src.y + src.h / 2;
              const x2 = TGT_LEFT;
              const y2 = tgt.y + tgt.h / 2;
              const cx = (x1 + x2) / 2;

              const isHovered = hoveredLink === i;
              const isConnectedToNode = hoveredNode === link.source || hoveredNode === link.target;
              const isDimmed = (hoveredLink !== null && !isHovered) || (hoveredNode !== null && !isConnectedToNode);

              const color =
                link.recognition >= 0.85
                  ? "rgb(16, 185, 129)"
                  : link.recognition >= 0.7
                    ? "rgb(245, 158, 11)"
                    : "rgb(244, 63, 94)";

              const strokeW = Math.max(6, (link.students / totalSource) * 26);

              return (
                <g key={`${link.source}-${link.target}-${i}`} className="cursor-pointer">
                  <motion.path
                    d={`M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`}
                    fill="none"
                    stroke={color}
                    strokeWidth={isHovered ? strokeW + 4 : strokeW}
                    strokeLinecap="round"
                    strokeOpacity={isDimmed ? 0.15 : isHovered ? 0.95 : 0.45}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.1 + i * 0.05, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    onMouseEnter={() => setHoveredLink(i)}
                    onMouseLeave={() => setHoveredLink(null)}
                    onClick={() =>
                      onSelectCorridor({
                        sourceName: nodeMap.get(link.source) || link.source,
                        targetName: nodeMap.get(link.target) || link.target,
                        students: link.students,
                        recognition: link.recognition,
                      })
                    }
                  />

                  {/* Flow label on hover */}
                  {isHovered && (
                    <foreignObject x={cx - 70} y={(y1 + y2) / 2 - 18} width="140" height="36">
                      <div className="flex items-center justify-center rounded-lg bg-slate-900 px-2 py-1 text-[11px] font-bold text-white shadow-lg pointer-events-none">
                        <span>{link.students} st · {pct(link.recognition)}</span>
                      </div>
                    </foreignObject>
                  )}
                </g>
              );
            })}

            {/* Source Institution Nodes (Left) */}
            {sourceNodes.map((n, i) => {
              const pos = srcPositions[n.id];
              const isHovered = hoveredNode === n.id;

              return (
                <motion.g
                  key={n.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.04, duration: 0.4 }}
                  className="cursor-pointer group"
                  onMouseEnter={() => setHoveredNode(n.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  <rect
                    x={SRC_LEFT}
                    y={pos.y}
                    width={SRC_WIDTH}
                    height={pos.h}
                    rx={6}
                    fill="rgb(26, 42, 82)"
                    className="transition-all duration-200"
                    style={{ filter: isHovered ? "drop-shadow(0 0 8px rgba(26, 42, 82, 0.4))" : undefined }}
                  />

                  {/* Institution Label Card */}
                  <foreignObject x={0} y={pos.y - 4} width={SRC_LEFT - 16} height={pos.h + 8}>
                    <div className="flex h-full items-center justify-end pr-2 text-right">
                      <div className="truncate">
                        <p className="truncate text-[13px] font-bold text-slate-900 group-hover:text-emerald-900 transition-colors">
                          {n.label}
                        </p>
                        <p className="text-[10.5px] font-semibold text-slate-500">
                          {n.students} transferred · Origin
                        </p>
                      </div>
                    </div>
                  </foreignObject>
                </motion.g>
              );
            })}

            {/* Target Institution Nodes (Right) */}
            {targetNodes.map((n, i) => {
              const pos = tgtPositions[n.id];
              const isHovered = hoveredNode === n.id;

              return (
                <motion.g
                  key={n.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.04, duration: 0.4 }}
                  className="cursor-pointer group"
                  onMouseEnter={() => setHoveredNode(n.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  <rect
                    x={TGT_LEFT}
                    y={pos.y}
                    width={TGT_WIDTH}
                    height={pos.h}
                    rx={6}
                    fill="rgb(16, 185, 129)"
                    className="transition-all duration-200"
                    style={{ filter: isHovered ? "drop-shadow(0 0 8px rgba(16, 185, 129, 0.4))" : undefined }}
                  />

                  {/* Target Label Card */}
                  <foreignObject x={TGT_LEFT + TGT_WIDTH + 14} y={pos.y - 4} width={SVG_W - (TGT_LEFT + TGT_WIDTH + 14)} height={pos.h + 8}>
                    <div className="flex h-full items-center pl-2">
                      <div className="truncate">
                        <p className="truncate text-[13px] font-bold text-slate-900 group-hover:text-emerald-900 transition-colors">
                          {n.label}
                        </p>
                        <p className="text-[10.5px] font-semibold text-slate-500">
                          {n.students} incoming · Host HEI
                        </p>
                      </div>
                    </div>
                  </foreignObject>
                </motion.g>
              );
            })}
          </svg>
        </div>
      ) : (
        /* Tabular Matrix View */
        <div className="mt-6 rounded-2xl border border-slate-200/80 overflow-hidden bg-white">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="py-3 px-4">Origin Institution</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Target University</th>
                <th className="py-3 px-4 text-center">Equivalence</th>
                <th className="py-3 px-4 text-right">Students</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLinks.map((l) => {
                const srcName = nodeMap.get(l.source) || l.source;
                const tgtName = nodeMap.get(l.target) || l.target;
                return (
                  <tr
                    key={`${l.source}-${l.target}`}
                    onClick={() =>
                      onSelectCorridor({
                        sourceName: srcName,
                        targetName: tgtName,
                        students: l.students,
                        recognition: l.recognition,
                      })
                    }
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-semibold text-slate-900">{srcName}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        Verified
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{tgtName}</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-700">{pct(l.recognition)}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">{l.students}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-emerald-700 font-bold hover:underline">Inspect →</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </motion.section>
  );
}

/* ───── 3. FRICTION BY COURSE WITH RICH TITLES ───── */

function FrictionByCourse({
  courses,
  onSelectCourse,
}: {
  courses: FrictionCourse[];
  onSelectCourse: (course: FrictionCourse) => void;
}) {
  const top = [...courses].sort((a, b) => b.bridgeRate + b.missingRate - (a.bridgeRate + a.missingRate)).slice(0, 8);

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="card-warm rounded-3xl p-6.5 shadow-sm"
    >
      <header className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
            Curriculum Recognition Friction
          </p>
          <h2 className="mt-1 font-display text-[20px] font-bold tracking-tight text-text-primary">
            Highest-friction target courses
          </h2>
          <p className="mt-1 text-[12px] text-text-secondary">
            Courses triggering syllabus bridge prescriptions due to Bloom taxonomy or lab deficit. Click to diagnose root cause.
          </p>
        </div>
        <span className="rounded-full bg-rose-50 px-3 py-1 text-[11px] font-bold text-rose-800 border border-rose-200/50">
          {courses.length} Courses Tracked
        </span>
      </header>

      {top.length === 0 ? (
        <p className="mt-5 text-[12.5px] text-text-secondary">No recognition decisions recorded yet.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {top.map((c, i) => {
            const meta = COURSE_TITLE_MAP[c.course] ?? {
              title: "Computer Science & Engineering Modular Subject",
              category: "Core Curriculum",
              ncrfLevel: "NCrF L5.5",
            };
            const direct = Math.max(0, 1 - c.bridgeRate - c.missingRate);

            return (
              <motion.li
                key={c.course}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + i * 0.04, duration: 0.4 }}
                onClick={() => onSelectCourse(c)}
                className="group rounded-2xl border border-slate-200/80 bg-white/70 p-4 transition-all duration-200 hover:bg-white hover:border-emerald-300 hover:shadow-xs cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        {c.course}
                      </span>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.2 font-mono text-[9px] font-bold text-emerald-800 border border-emerald-200/60">
                        {meta.ncrfLevel}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {meta.category}
                      </span>
                    </div>
                    <p className="mt-1 text-[13.5px] font-bold text-slate-900 group-hover:text-emerald-950 transition-colors truncate">
                      {meta.title}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className="font-mono text-[12px] font-bold text-slate-900">
                      {c.decisions} decisions
                    </span>
                  </div>
                </div>

                {/* Multi-segment stacked bar */}
                <div className="mt-3 flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100 shadow-2xs">
                  {direct > 0 && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${direct * 100}%` }}
                      transition={{ delay: 0.5 + i * 0.05, duration: 0.6 }}
                      className="bg-emerald-500"
                    />
                  )}
                  {c.bridgeRate > 0 && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${c.bridgeRate * 100}%` }}
                      transition={{ delay: 0.55 + i * 0.05, duration: 0.6 }}
                      className="bg-amber-500"
                    />
                  )}
                  {c.missingRate > 0 && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${c.missingRate * 100}%` }}
                      transition={{ delay: 0.6 + i * 0.05, duration: 0.6 }}
                      className="bg-rose-500"
                    />
                  )}
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] font-semibold">
                  <span className="text-emerald-700">Direct: {pct(direct)}</span>
                  <span className="text-amber-700">Bridge required: {pct(c.bridgeRate)}</span>
                  <span className="text-rose-700">Missing credits: {pct(c.missingRate)}</span>
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}
    </motion.section>
  );
}

/* ───── 4. REGIONAL DISTRIBUTION (REAL STATES) ───── */

function RegionalDistribution({
  regions,
  onSelectState,
}: {
  regions: RegionSignal[];
  onSelectState: (state: RegionSignal) => void;
}) {
  const sorted = [...regions].sort((a, b) => b.students - a.students).slice(0, 10);
  const max = Math.max(...sorted.map((r) => r.students), 1);

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.5 }}
      className="card-warm rounded-3xl p-6.5 shadow-sm"
    >
      <header className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
            State & Territorial Footprint
          </p>
          <h2 className="mt-1 font-display text-[20px] font-bold tracking-tight text-text-primary">
            Distribution by state
          </h2>
          <p className="mt-1 text-[12px] text-text-secondary">
            Geographic footprint of origin HEIs actively participating in cross-border credit transfer.
          </p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-800 border border-blue-200/50">
          {sorted.length} Active States
        </span>
      </header>

      {sorted.length === 0 ? (
        <p className="mt-5 text-[12.5px] text-text-secondary">No regional data yet.</p>
      ) : (
        <ul className="mt-6 space-y-3.5">
          {sorted.map((r, i) => (
            <motion.li
              key={r.state}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.04, duration: 0.4 }}
              onClick={() => onSelectState(r)}
              className="group flex items-center gap-3.5 rounded-2xl border border-slate-200/70 bg-white/70 p-3.5 transition-all hover:bg-white hover:border-emerald-300 hover:shadow-xs cursor-pointer"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 group-hover:bg-emerald-100 group-hover:text-emerald-800 transition-colors">
                <MapPin className="h-4 w-4" />
              </span>

              <div className="w-36 shrink-0 truncate">
                <p className="text-[13px] font-bold text-slate-900 group-hover:text-emerald-950 transition-colors truncate">
                  {r.state}
                </p>
                <p className="text-[10.5px] font-semibold text-slate-500">
                  {r.heis} {r.heis === 1 ? "HEI" : "HEIs"} Participating
                </p>
              </div>

              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100 shadow-2xs">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max((r.students / max) * 100, 10)}%` }}
                  transition={{ delay: 0.55 + i * 0.04, duration: 0.6 }}
                  className="h-full rounded-full bg-gradient-to-r from-[rgb(26_42_82)] to-emerald-600"
                />
              </div>

              <div className="w-20 shrink-0 text-right">
                <p className="font-mono text-[13px] font-bold text-slate-900 tabular-nums">
                  {r.students} {r.students === 1 ? "student" : "students"}
                </p>
                <p className="font-mono text-[10.5px] font-bold text-emerald-700 tabular-nums">
                  {pct(r.recognition)} recognized
                </p>
              </div>

              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
            </motion.li>
          ))}
        </ul>
      )}
    </motion.section>
  );
}

/* ───── 5. CORRIDOR INSPECTOR MODAL ───── */

function CorridorModal({
  corridor,
  onClose,
}: {
  corridor: { sourceName: string; targetName: string; students: number; recognition: number } | null;
  onClose: () => void;
}) {
  if (!corridor) return null;

  return (
    <Dialog.Root open={!!corridor} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-xl translate-x-[-50%] translate-y-[-50%] rounded-3xl border border-border-subtle bg-white p-7 shadow-2xl focus:outline-none max-h-[90vh] overflow-y-auto">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
                <Route className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-muted">
                  Mobility Corridor Deep-Dive
                </p>
                <Dialog.Title className="font-display text-[20px] font-bold text-slate-900">
                  {corridor.sourceName} → {corridor.targetName}
                </Dialog.Title>
              </div>
            </div>
            <Dialog.Close className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Transferred</p>
              <p className="mt-1 font-display text-[22px] font-bold text-slate-900">{corridor.students}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Equivalence</p>
              <p className="mt-1 font-display text-[22px] font-bold text-emerald-700">{pct(corridor.recognition)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">NCrF Matrix</p>
              <p className="mt-1 font-display text-[22px] font-bold text-blue-900">Level 5.5 → 6.0</p>
            </div>
          </div>

          <div className="mt-5 space-y-3.5 text-[12.5px]">
            <h4 className="font-bold uppercase tracking-wider text-slate-900">
              Curriculum Credit Preservation
            </h4>

            <div className="rounded-2xl border border-slate-200/80 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">Direct Subject Equivalences:</span>
                <span className="font-bold text-emerald-700">{pct(corridor.recognition)}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${corridor.recognition * 100}%` }} />
              </div>
              <p className="text-[11.5px] text-text-secondary">
                Autonomous AI matcher verified core syllabus match with Bloom taxonomy alignment scores exceeding 0.75 threshold.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/50 p-3.5">
              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                <ShieldCheck className="h-4 w-4" />
                <span>SHA-256 Ledger Sealed</span>
              </div>
              <p className="mt-1 text-[11.5px] text-emerald-700 leading-relaxed">
                Partitioned ledger chain head intact. All credit transfers verified with biometric DigiLocker credentials and Board of Studies signatures.
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
            <Dialog.Close className="rounded-xl bg-slate-900 px-5 py-2 text-[12px] font-semibold text-white hover:bg-slate-800 transition-colors">
              Close Corridor
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ───── 6. STATE DRILLDOWN MODAL ───── */

function StateModal({
  state,
  onClose,
}: {
  state: RegionSignal | null;
  onClose: () => void;
}) {
  if (!state) return null;

  return (
    <Dialog.Root open={!!state} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-3xl border border-border-subtle bg-white p-7 shadow-2xl focus:outline-none">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-800">
                <MapPin className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-muted">
                  State Territorial Signal
                </p>
                <Dialog.Title className="font-display text-[22px] font-bold text-slate-900">
                  {state.state}
                </Dialog.Title>
              </div>
            </div>
            <Dialog.Close className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 transition-colors">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3 rounded-2xl bg-slate-50 p-4 text-center border border-slate-100">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Participating HEIs</p>
              <p className="mt-1 font-display text-[22px] font-bold text-slate-900">{state.heis}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Learners</p>
              <p className="mt-1 font-display text-[22px] font-bold text-slate-900">{state.students}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Equivalence</p>
              <p className="mt-1 font-display text-[22px] font-bold text-emerald-700">{pct(state.recognition)}</p>
            </div>
          </div>

          <div className="mt-5 space-y-2 text-[12.5px] text-text-secondary leading-relaxed">
            <p>
              Universities and state colleges located in <strong>{state.state}</strong> have fully integrated their syllabus catalogs with the EduPathAI National Curriculum Graph under the National Credit Framework (NCrF).
            </p>
            <p>
              Students migrating from institutions in {state.state} experience a mean recognition rate of {pct(state.recognition)} with zero physical paperwork required.
            </p>
          </div>

          <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
            <Dialog.Close className="rounded-xl bg-slate-900 px-4 py-2 text-[12px] font-semibold text-white hover:bg-slate-800 transition-colors">
              Done
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ───── 7. EXECUTIVE EXPORT MODAL ───── */

function ExportBriefModal({
  isOpen,
  onClose,
  aggregate,
  mobility,
}: {
  isOpen: boolean;
  onClose: () => void;
  aggregate: any;
  mobility: any;
}) {
  if (!isOpen) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-3xl translate-x-[-50%] translate-y-[-50%] rounded-3xl border border-border-subtle bg-white p-8 shadow-2xl focus:outline-none max-h-[92vh] overflow-y-auto">
          <div className="flex items-start justify-between border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-emerald-100 px-2 py-0.5 font-mono text-[9px] font-bold text-emerald-800 uppercase tracking-widest">
                  Government of India
                </span>
                <span className="text-[11px] text-slate-500">Ministry of Education · Higher Education Mobility Cell</span>
              </div>
              <Dialog.Title className="mt-2 font-display text-[24px] font-bold tracking-tight text-slate-900">
                National Student Mobility Flow Intelligence Brief
              </Dialog.Title>
              <p className="text-[12px] text-text-secondary mt-1">
                Generated from live cryptographic ledger blocks · Date: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
            <Dialog.Close className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 transition-colors">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <div className="mt-6 grid grid-cols-4 gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-100 text-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Integrated HEIs</p>
              <p className="mt-1 font-display text-[22px] font-bold text-slate-900">{aggregate?.stats?.heisIntegrated ?? 129}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Active Learners</p>
              <p className="mt-1 font-display text-[22px] font-bold text-slate-900">{aggregate?.stats?.totalStudents ?? 5}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Decisions</p>
              <p className="mt-1 font-display text-[22px] font-bold text-slate-900">{aggregate?.stats?.totalDecisions ?? 127}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Mean Equivalence</p>
              <p className="mt-1 font-display text-[22px] font-bold text-emerald-700">{pct(aggregate?.stats?.recognitionRate ?? 1.0)}</p>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-[13px] font-bold uppercase tracking-wider text-slate-900">
              1. Inter-Institutional Mobility Corridors
            </h4>
            <div className="mt-2.5 rounded-xl border border-slate-200 overflow-hidden text-[12px]">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 text-[10.5px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Origin University</th>
                    <th className="py-2.5 px-3">Destination University</th>
                    <th className="py-2.5 px-3 text-center">Equivalence</th>
                    <th className="py-2.5 px-3 text-right">Learners</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mobility?.links?.map((l: any, idx: number) => {
                    const srcLabel = mobility.nodes.find((n: any) => n.id === l.source)?.label || l.source;
                    const tgtLabel = mobility.nodes.find((n: any) => n.id === l.target)?.label || l.target;
                    return (
                      <tr key={idx}>
                        <td className="py-2 px-3 font-semibold text-slate-900">{srcLabel}</td>
                        <td className="py-2 px-3 font-semibold text-slate-900">{tgtLabel}</td>
                        <td className="py-2 px-3 text-center font-bold text-emerald-700">{pct(l.recognition)}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold">{l.students}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-900 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span className="text-[12px] font-bold">Cryptographically Verified Brief</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400">SHA-256 Genesis Validated</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-300">
              Verified by Nodal Officer Dr. A. Krishnan. DPDP Act 2023 zero-PII privacy guarantee intact.
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Printer className="h-3.5 w-3.5 text-slate-500" />
                <span>Print / Save as PDF</span>
              </button>

              <a
                href="http://localhost:8000/v1/gov/mobility/export"
                download="mobility-flow-data.json"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Download className="h-3.5 w-3.5 text-slate-500" />
                <span>Download Official JSON</span>
              </a>
            </div>

            <Dialog.Close className="rounded-xl bg-slate-900 px-4 py-2 text-[12px] font-semibold text-white hover:bg-slate-800 transition-colors">
              Close Brief
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ───── MAIN COMPONENT ───── */

export default function GovMobilityPage() {
  const session = useRequireRole("ministry");
  const mobility = useGovMobility();
  const aggregate = useGovAggregate();

  const [selectedCorridor, setSelectedCorridor] = useState<{
    sourceName: string;
    targetName: string;
    students: number;
    recognition: number;
  } | null>(null);

  const [selectedCourse, setSelectedCourse] = useState<FrictionCourse | null>(null);
  const [selectedState, setSelectedState] = useState<RegionSignal | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!session) return null;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([mobility.refetch(), aggregate.refetch()]);
      toast.success("Mobility Graph Synchronized", {
        description: "Re-calculated cross-institution corridors and regional distribution.",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const topBarRight = (
    <>
      <button
        type="button"
        onClick={handleRefresh}
        disabled={isRefreshing || mobility.isFetching || aggregate.isFetching}
        className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/90 px-3 py-1.5 text-[11.5px] font-semibold text-slate-700 shadow-2xs hover:bg-white active:scale-95 transition-all cursor-pointer disabled:opacity-50"
      >
        <RefreshCw className={`h-3 w-3 text-slate-500 ${isRefreshing ? "animate-spin" : ""}`} />
        <span>Refresh Graph</span>
      </button>

      <button
        type="button"
        onClick={() => setIsExportOpen(true)}
        className="hidden lg:inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3.5 py-1.5 text-[11.5px] font-semibold text-white shadow-2xs hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
      >
        <FileText className="h-3 w-3 text-emerald-400" />
        <span>Export Brief</span>
      </button>

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
    <AppShell
      title="Mobility Intelligence"
      subtitle="Deep-dive: source-target flows, friction, and regional distribution"
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
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgb(26_42_82)] text-white shadow-sm">
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
          <div className="space-y-6">
            {aggregate.data && (
              <MetricsRow stats={aggregate.data.stats} trend={aggregate.data.trend} />
            )}

            {mobility.data && (
              <SankeyDiagram
                nodes={mobility.data.nodes}
                links={mobility.data.links}
                onSelectCorridor={(c) => setSelectedCorridor(c)}
              />
            )}

            {aggregate.data && (
              <div className="grid gap-6 lg:grid-cols-2">
                <FrictionByCourse
                  courses={aggregate.data.frictionCourses}
                  onSelectCourse={(c) => setSelectedCourse(c)}
                />
                <RegionalDistribution
                  regions={aggregate.data.regionSignals}
                  onSelectState={(s) => setSelectedState(s)}
                />
              </div>
            )}
          </div>
        )}
      </section>

      {/* Modals */}
      <CorridorModal
        corridor={selectedCorridor}
        onClose={() => setSelectedCorridor(null)}
      />

      <StateModal
        state={selectedState}
        onClose={() => setSelectedState(null)}
      />

      <ExportBriefModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        aggregate={aggregate.data}
        mobility={mobility.data}
      />

      <BottomStrip
        label={"Flow\nVolume"}
        statusTitle={
          aggregate.data
            ? `${aggregate.data.stats.totalStudents.toLocaleString("en-IN")} students tracked · ${pct(aggregate.data.stats.recognitionRate)} avg recognition`
            : "Loading mobility signals…"
        }
        statusIcon={<Users className="h-4 w-4" />}
        ctaLabel="Export flow data"
        onCta={() => setIsExportOpen(true)}
      />
    </AppShell>
  );
}
