"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Clock,
  ExternalLink,
  X,
  FileText,
  AlertCircle,
} from "lucide-react";
import {
  DEMO_STATS,
  DEMO_RECOGNITION_BREAKDOWN,
  DEMO_COURSE_MATCHES,
  DEMO_ROADMAP,
  type CourseMatchRow,
  type RoadmapStep,
} from "@/lib/constants/demo-pathway-infographic";
import { cn } from "@/lib/utils/cn";

/* ═══════════════════════════════════════════════════════════════
   HOOK — count-up animation
   ═══════════════════════════════════════════════════════════════ */
function useCountUp(target: number, duration = 1100, delay = 0) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf = 0;
    let start = 0;
    const timeout = setTimeout(() => {
      const tick = (t: number) => {
        if (!start) start = t;
        const p = Math.min((t - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setValue(Math.round(target * eased));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, delay);
    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(raf);
    };
  }, [target, duration, delay]);
  return value;
}

/* ═══════════════════════════════════════════════════════════════
   BLOCK 1 — THE VERDICT (interactive composition bar)
   ═══════════════════════════════════════════════════════════════ */

type FilterKey = "Direct" | "Bridge" | "Missing" | "Review";

interface TheVerdictProps {
  activeFilter: FilterKey | null;
  onFilterChange: (f: FilterKey | null) => void;
}

function CompositionBar({
  activeFilter,
  onFilterChange,
}: TheVerdictProps) {
  const total = DEMO_RECOGNITION_BREAKDOWN.reduce((s, d) => s + d.value, 0);
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="mt-6">
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
        {DEMO_RECOGNITION_BREAKDOWN.map((item, i) => {
          const pct = (item.value / total) * 100;
          const isActive = activeFilter === item.name;
          const isDimmed = activeFilter && !isActive;
          return (
            <motion.button
              key={item.name}
              initial={{ width: 0 }}
              animate={{
                width: `${pct}%`,
                opacity: isDimmed ? 0.3 : 1,
              }}
              transition={{
                width: {
                  delay: 0.5 + i * 0.12,
                  duration: 0.9,
                  ease: [0.16, 1, 0.3, 1],
                },
                opacity: { duration: 0.25 },
              }}
              onMouseEnter={() => setHovered(item.name)}
              onMouseLeave={() => setHovered(null)}
              onClick={() =>
                onFilterChange(isActive ? null : (item.name as FilterKey))
              }
              style={{ backgroundColor: item.color }}
              className={cn(
                "relative cursor-pointer outline-none transition-transform",
                isActive && "scale-y-125"
              )}
              aria-label={`Filter by ${item.name}: ${item.value} credits`}
            >
              {hovered === item.name && (
                <div className="pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white shadow-lg">
                  {item.name} · {item.value}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5 md:grid-cols-4">
        {DEMO_RECOGNITION_BREAKDOWN.map((item, i) => {
          const pct = Math.round((item.value / total) * 100);
          const isActive = activeFilter === item.name;
          return (
            <motion.button
              key={item.name}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.06, duration: 0.4 }}
              onClick={() =>
                onFilterChange(isActive ? null : (item.name as FilterKey))
              }
              className={cn(
                "group flex items-center gap-2 rounded-md px-2 py-1 text-left transition-colors",
                isActive ? "bg-canvas" : "hover:bg-canvas/60"
              )}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                {item.name}
              </span>
              <span className="ml-auto font-mono text-[12px] font-semibold tabular-nums text-text-primary">
                {item.value}
              </span>
              <span className="w-8 text-right font-mono text-[10.5px] tabular-nums text-text-muted">
                {pct}%
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function TheVerdict({ activeFilter, onFilterChange }: TheVerdictProps) {
  const alignment = useCountUp(DEMO_STATS.alignment, 1200, 100);
  const recognized = useCountUp(DEMO_STATS.recognized, 1100, 250);
  const bridges = useCountUp(DEMO_STATS.bridges, 900, 350);
  const sems = useCountUp(DEMO_STATS.semsRemaining, 900, 450);

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="glass-strong relative overflow-hidden rounded-3xl p-8 md:p-10"
    >
      {/* Gradient mesh background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 80% at 10% 20%, rgb(16 185 129 / 0.10) 0%, transparent 60%), radial-gradient(ellipse 40% 70% at 92% 15%, rgb(245 158 11 / 0.10) 0%, transparent 55%)",
        }}
      />

      <div className="relative grid gap-10 lg:grid-cols-[auto_1fr_auto] lg:items-center">
        {/* LEFT — big number */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
            Pathway Recognition
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-[72px] font-bold leading-none tracking-tighter text-[rgb(26_42_82)] tabular-nums">
              {alignment}
            </span>
            <span className="font-display text-[28px] font-semibold leading-none text-[rgb(26_42_82)]/50">
              %
            </span>
          </div>
          <p className="mt-3 max-w-[190px] text-[12.5px] leading-snug text-text-secondary">
            of your prior learning maps cleanly to the target programme
          </p>
        </div>

        {/* CENTER — stats + interactive bar */}
        <div className="lg:border-l lg:border-r lg:border-border-subtle/60 lg:px-10">
          <div className="grid grid-cols-3 gap-6">
            {[
              { label: "Credits Recognized", value: recognized, tone: "emerald" },
              { label: "Bridges Required", value: bridges, tone: "amber" },
              { label: "Semesters Left", value: sems, tone: "navy" },
            ].map((s) => (
              <div key={s.label}>
                <p
                  className={cn(
                    "font-display text-[38px] font-bold leading-none tracking-tight tabular-nums",
                    s.tone === "emerald" && "text-emerald-600",
                    s.tone === "amber" && "text-amber-600",
                    s.tone === "navy" && "text-[rgb(26_42_82)]"
                  )}
                >
                  {s.value}
                </p>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          <CompositionBar
            activeFilter={activeFilter}
            onFilterChange={onFilterChange}
          />
        </div>

        {/* RIGHT — tag + hint */}
        <div className="flex flex-col items-start gap-3 lg:items-end">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/70 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800">
            <Sparkles className="h-3 w-3" />
            Optimal Path
          </span>
          <p className="max-w-[190px] text-right text-[11.5px] leading-snug text-text-muted">
            Click a segment to filter the courses below
          </p>
        </div>
      </div>
    </motion.section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BLOCK 2 — COURSE MATCH FLOW (filterable + expandable rows)
   ═══════════════════════════════════════════════════════════════ */

function MatchConnector({ status }: { status: CourseMatchRow["status"] }) {
  const color =
    status === "direct"
      ? "rgb(16 185 129)"
      : status === "bridge"
      ? "rgb(245 158 11)"
      : "rgb(244 63 94)";

  return (
    <svg viewBox="0 0 56 12" className="h-3 w-14 shrink-0" aria-hidden>
      <line
        x1="0"
        y1="6"
        x2="44"
        y2="6"
        stroke={color}
        strokeWidth="1.5"
        strokeDasharray={status === "direct" ? undefined : "3 3"}
        strokeLinecap="round"
      />
      <path d="M 44 2 L 54 6 L 44 10 Z" fill={color} />
    </svg>
  );
}

interface CourseMatchFlowProps {
  activeFilter: FilterKey | null;
  onClearFilter: () => void;
}

function CourseMatchFlow({
  activeFilter,
  onClearFilter,
}: CourseMatchFlowProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!activeFilter) return DEMO_COURSE_MATCHES;
    const key = activeFilter.toLowerCase();
    return DEMO_COURSE_MATCHES.filter((r) => r.status === key);
  }, [activeFilter]);

  const STATUS_CHIP: Record<
    CourseMatchRow["status"],
    { bg: string; fg: string; label: string }
  > = {
    direct: { bg: "bg-emerald-100", fg: "text-emerald-800", label: "Direct" },
    bridge: { bg: "bg-amber-100", fg: "text-amber-900", label: "Bridge" },
    missing: { bg: "bg-rose-100", fg: "text-rose-800", label: "Missing" },
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.5 }}
      className="card-warm overflow-hidden rounded-3xl p-8"
    >
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
            Course Match Flow
          </p>
          <h2 className="mt-1.5 font-display text-[22px] font-bold tracking-tight text-text-primary">
            Source curriculum → Target programme
          </h2>
        </div>

        <AnimatePresence mode="wait">
          {activeFilter ? (
            <motion.button
              key="chip"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={onClearFilter}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white"
            >
              <span>Filter: {activeFilter}</span>
              <X className="h-3 w-3" />
            </motion.button>
          ) : (
            <motion.span
              key="count"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="hidden shrink-0 rounded-full border border-border-subtle px-3 py-1.5 text-[11px] font-medium text-text-secondary md:inline-flex"
            >
              {DEMO_COURSE_MATCHES.length} courses
            </motion.span>
          )}
        </AnimatePresence>
      </header>

      {/* Column labels */}
      <div className="mt-7 grid grid-cols-[1fr_80px_1fr_60px] items-center gap-4 border-b border-border-subtle/60 pb-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted">
          Calcutta · Source
        </span>
        <span />
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted">
          IIT Delhi · Target
        </span>
        <span />
      </div>

      {/* Rows */}
      <ul className="divide-y divide-border-subtle/50">
        <AnimatePresence initial={false}>
          {filtered.length === 0 && (
            <motion.li
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center gap-2 py-14 text-center"
            >
              <AlertCircle className="h-5 w-5 text-text-muted" />
              <p className="text-[13px] font-medium text-text-secondary">
                No courses match this filter
              </p>
              <button
                onClick={onClearFilter}
                className="text-[12px] font-semibold text-emerald-600 hover:underline"
              >
                Clear filter
              </button>
            </motion.li>
          )}

          {filtered.map((row) => {
            const chip = STATUS_CHIP[row.status];
            const expanded = expandedId === row.id;
            return (
              <motion.li
                key={row.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 6 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="group"
              >
                <button
                  onClick={() =>
                    setExpandedId(expanded ? null : row.id)
                  }
                  className="grid w-full grid-cols-[1fr_80px_1fr_60px] items-center gap-4 py-4 text-left transition-colors hover:bg-canvas/40"
                >
                  {/* Source */}
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">
                      {row.sourceCode}
                    </p>
                    <p className="mt-0.5 truncate text-[14px] font-semibold leading-tight tracking-tight text-text-primary">
                      {row.sourceTitle}
                    </p>
                  </div>

                  {/* Connector */}
                  <div className="flex justify-center">
                    <MatchConnector status={row.status} />
                  </div>

                  {/* Target */}
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">
                      {row.targetCode}
                    </p>
                    <p className="mt-0.5 truncate text-[14px] font-semibold leading-tight tracking-tight text-text-primary">
                      {row.targetTitle}
                    </p>
                  </div>

                  {/* Status + score */}
                  <div className="flex flex-col items-end gap-1.5">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider",
                        chip.bg,
                        chip.fg
                      )}
                    >
                      {chip.label}
                    </span>
                    <span className="font-mono text-[11px] font-medium tabular-nums text-text-muted">
                      {Math.round(row.score * 100)}%
                    </span>
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div
                      key="details"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="mb-4 grid gap-3 rounded-xl bg-canvas/60 p-4 md:grid-cols-3">
                        <DetailItem
                          label="Semantic Score"
                          value={`${Math.round(row.score * 100)}%`}
                        />
                        <DetailItem
                          label="Outcome Coverage"
                          value={`${Math.round(row.score * 100 - 5)}%`}
                        />
                        <DetailItem
                          label="Evidence"
                          value="3 refs"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </motion.section>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted">
        {label}
      </p>
      <p className="mt-1 font-display text-[18px] font-bold tracking-tight text-text-primary tabular-nums">
        {value}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BLOCK 3 — BRIDGE QUEUE
   ═══════════════════════════════════════════════════════════════ */

const DEMO_BRIDGES = [
  {
    provider: "NPTEL",
    title: "Analysis of Algorithms Unit 3 & 4",
    duration: "18 hrs",
    extra: "Online Lab",
  },
  {
    provider: "SWAYAM",
    title: "Advanced Algorithmic Thinking",
    duration: "12 hrs",
    extra: "Self-paced",
  },
  {
    provider: "V-Lab",
    title: "Network Flow Simulation Lab",
    duration: "6 hrs",
    extra: "Virtual",
  },
];

function BridgeQueue() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.5 }}
      className="card-warm flex h-full flex-col overflow-hidden rounded-3xl p-8"
    >
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
          BridgePath Engine
        </p>
        <h2 className="mt-1.5 font-display text-[22px] font-bold tracking-tight text-text-primary">
          Recommended bridges
        </h2>
      </header>

      <ul className="mt-6 flex-1 space-y-3">
        {DEMO_BRIDGES.map((b, i) => (
          <motion.li
            key={b.provider}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.08, duration: 0.45 }}
            className="group relative overflow-hidden rounded-2xl border border-border-subtle bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
          >
            <span className="absolute inset-y-0 left-0 w-[3px] bg-amber-400 transition-colors group-hover:bg-emerald-500" />

            <div className="flex items-start justify-between gap-3 pl-2">
              <div className="min-w-0">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700">
                  {b.provider}
                </p>
                <p className="mt-1 text-[13.5px] font-semibold leading-snug tracking-tight text-text-primary">
                  {b.title}
                </p>
                <div className="mt-2 flex items-center gap-2 text-[11px] font-medium text-text-muted">
                  <Clock className="h-3 w-3" />
                  <span>{b.duration}</span>
                  <span className="text-border-strong">·</span>
                  <span>{b.extra}</span>
                </div>
              </div>
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-text-muted transition-colors group-hover:text-emerald-600" />
            </div>
          </motion.li>
        ))}
      </ul>

      <button className="pill-navy mt-5 w-full justify-between">
        <span>Enroll in all bridges</span>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </button>
    </motion.section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BLOCK 4 — ROADMAP TIMELINE
   ═══════════════════════════════════════════════════════════════ */

function TimelineNode({ step, index }: { step: RoadmapStep; index: number }) {
  const isCurrent = step.kind === "current";
  const isBridge = step.kind === "bridge";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55 + index * 0.08, duration: 0.5 }}
      className="relative flex flex-1 flex-col items-center"
    >
      <div className="relative flex h-4 w-4 items-center justify-center">
        {isCurrent && (
          <span className="absolute inset-0 animate-ping rounded-full bg-[rgb(26_42_82)] opacity-40" />
        )}
        <span
          className={cn(
            "relative h-3.5 w-3.5 rounded-full border-2",
            isCurrent && "border-[rgb(26_42_82)] bg-[rgb(26_42_82)]",
            isBridge && "border-amber-500 bg-amber-100",
            step.kind === "semester" && "border-slate-300 bg-white"
          )}
        />
      </div>

      <p
        className={cn(
          "mt-3 text-[12px] font-bold tracking-tight",
          isCurrent ? "text-[rgb(26_42_82)]" : "text-text-primary"
        )}
      >
        {step.label}
      </p>
      <p className="mt-0.5 text-[10.5px] font-medium text-text-muted">
        {step.sub}
      </p>
    </motion.div>
  );
}

function RoadmapTimeline() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.55 }}
      className="card-warm overflow-hidden rounded-3xl p-8"
    >
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
            Pathway Roadmap
          </p>
          <h2 className="mt-1.5 font-display text-[22px] font-bold tracking-tight text-text-primary">
            From current credits to graduation
          </h2>
        </div>
        <span className="hidden shrink-0 rounded-full border border-border-subtle px-3 py-1.5 text-[11px] font-medium text-text-secondary md:inline-flex">
          4 semesters · 1 summer bridge
        </span>
      </header>

      <div className="mt-10 overflow-x-auto pb-2">
        <div className="relative min-w-[760px]">
          <div className="pointer-events-none absolute left-[8%] right-[8%] top-[7px] h-[2px]">
            <div className="h-full w-full bg-slate-200" />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "8%" }}
              transition={{
                delay: 0.8,
                duration: 0.9,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="absolute inset-y-0 left-0 bg-[rgb(26_42_82)]"
            />
          </div>

          <div className="relative flex items-start justify-between">
            {DEMO_ROADMAP.map((step, i) => (
              <TimelineNode key={step.id} step={step} index={i} />
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════════════════════════ */

export function PathwayInfographic() {
  const [activeFilter, setActiveFilter] = useState<FilterKey | null>(null);

  return (
    <div className="space-y-5">
      <TheVerdict
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <CourseMatchFlow
          activeFilter={activeFilter}
          onClearFilter={() => setActiveFilter(null)}
        />
        <BridgeQueue />
      </div>

      <RoadmapTimeline />
    </div>
  );
}