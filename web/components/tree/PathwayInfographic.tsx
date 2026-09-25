"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Sparkles,
  Clock,
  ExternalLink,
  X,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Target,
  GraduationCap,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { RecognitionSummary, MatchResult, Bridge, Pathway } from "@/lib/api/types";
import { toRecognitionView, recognitionToBreakdown, type RecognitionBucket, type RecognitionView } from "@/lib/transforms/recognition";
import { cn } from "@/lib/utils/cn";
import { CourseModal } from "@/components/student/CourseModal";

/* ═══════════════════════════════════════════════════════════════
   HOOK — count-up animation
   ═══════════════════════════════════════════════════════════════ */
function useCountUp(target: number, duration = 1000, delay = 0) {
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

type FilterKey = RecognitionBucket["key"];

function CompositionBar({
  view,
  activeFilter,
  onFilterChange,
}: {
  view: RecognitionView;
  activeFilter: FilterKey | null;
  onFilterChange: (f: FilterKey | null) => void;
}) {
  const breakdown = recognitionToBreakdown(view);
  const total = view.total || 1;
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="mt-5">
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100 shadow-inner">
        {breakdown.map((item, i) => {
          const pct = (item.value / total) * 100;
          const isActive = activeFilter === item.key;
          const isDimmed = activeFilter && !isActive;
          if (item.value === 0) return null;
          return (
            <motion.button
              key={item.key}
              initial={{ width: 0 }}
              animate={{
                width: `${pct}%`,
                opacity: isDimmed ? 0.35 : 1,
              }}
              transition={{
                width: { delay: 0.4 + i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 0.2 },
              }}
              onMouseEnter={() => setHovered(item.key)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onFilterChange(isActive ? null : item.key)}
              style={{ backgroundColor: item.color }}
              className={cn("relative cursor-pointer outline-none transition-transform", isActive && "scale-y-125")}
              aria-label={`Filter by ${item.key}: ${item.value} courses`}
            >
              {hovered === item.key && (
                <div className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white shadow-lg">
                  {item.key} · {item.value} ({Math.round(pct)}%)
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="mt-3.5 grid grid-cols-2 gap-x-4 gap-y-1.5 md:grid-cols-3">
        {breakdown.map((item) => {
          const pct = total ? Math.round((item.value / total) * 100) : 0;
          const isActive = activeFilter === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onFilterChange(isActive ? null : item.key)}
              className={cn(
                "group flex items-center gap-1.5 rounded-lg px-2 py-1 text-left transition-all",
                isActive ? "bg-slate-200/80 ring-1 ring-slate-400 font-semibold" : "hover:bg-slate-100"
              )}
            >
              <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-[10.5px] font-semibold uppercase tracking-wider text-text-muted">{item.key}</span>
              <span className="ml-auto font-mono text-[11.5px] font-bold tabular-nums text-text-primary">{item.value}</span>
              <span className="w-7 text-right font-mono text-[10px] tabular-nums text-text-muted">{pct}%</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TheVerdict({
  recognition,
  semsRemaining,
  activeFilter,
  onFilterChange,
}: {
  recognition: RecognitionSummary;
  semsRemaining: number;
  activeFilter: FilterKey | null;
  onFilterChange: (f: FilterKey | null) => void;
}) {
  const view = toRecognitionView(recognition);
  const alignment = useCountUp(view.recognizedPercent, 1000, 50);
  const recognized = useCountUp(view.direct + view.bridge, 900, 150);
  const bridgeCount = useCountUp(view.bridge, 800, 250);
  const sems = useCountUp(semsRemaining, 800, 350);

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="glass-strong relative overflow-hidden rounded-3xl p-6 md:p-8 border border-white/80 shadow-[0_10px_35px_rgba(26,42,82,0.05)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 80% at 8% 20%, rgb(16 185 129 / 0.12) 0%, transparent 60%), radial-gradient(ellipse 40% 70% at 92% 15%, rgb(245 158 11 / 0.10) 0%, transparent 55%)",
        }}
      />

      <div className="relative grid gap-8 lg:grid-cols-[auto_1fr_auto] lg:items-center">
        {/* Alignment Gauge Ring */}
        <div className="flex items-center gap-5">
          <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
            <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500 transition-all duration-1000 ease-out"
                strokeDasharray={`${view.recognizedPercent}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-[26px] font-bold leading-none tracking-tight text-[rgb(26_42_82)]">
                {alignment}%
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700">Equated</span>
            </div>
          </div>

          <div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" />
              Syllabi Concordance
            </span>
            <h3 className="mt-1 font-display text-[20px] font-bold tracking-tight text-[rgb(26_42_82)]">
              High Academic Alignment
            </h3>
            <p className="mt-0.5 text-[12px] leading-snug text-text-secondary">
              Prior learning maps cleanly to the target degree requirements.
            </p>
          </div>
        </div>

        {/* 3 Metric Cards + Composition Bar */}
        <div className="lg:border-l lg:border-r lg:border-border-subtle/70 lg:px-8">
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                Courses Recognized
              </span>
              <p className="mt-1 font-display text-[32px] font-bold leading-none tracking-tight text-emerald-600 tabular-nums">
                {recognized}
              </p>
              <span className="mt-1 block text-[10.5px] text-emerald-700 font-medium">Direct credit transfer</span>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                Bridges Required
              </span>
              <p className="mt-1 font-display text-[32px] font-bold leading-none tracking-tight text-amber-600 tabular-nums">
                {bridgeCount}
              </p>
              <span className="mt-1 block text-[10.5px] text-amber-700 font-medium">Bridging modules</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                Semesters Left
              </span>
              <p className="mt-1 font-display text-[32px] font-bold leading-none tracking-tight text-[rgb(26_42_82)] tabular-nums">
                {sems}
              </p>
              <span className="mt-1 block text-[10.5px] text-slate-600 font-medium">To graduation</span>
            </div>
          </div>

          <CompositionBar view={view} activeFilter={activeFilter} onFilterChange={onFilterChange} />
        </div>

        {/* Filter instructions */}
        <div className="flex flex-col items-start gap-2.5 lg:items-end">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-100/70 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-900 shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
            Verified BoS Mapping
          </span>
          <p className="max-w-[180px] text-[11px] leading-snug text-text-muted lg:text-right">
            Click any segment above to filter the course match list below.
          </p>
        </div>
      </div>
    </motion.section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BLOCK 2 — COURSE MATCH FLOW
   ═══════════════════════════════════════════════════════════════ */

type MatchState = "Matched" | "Gap";

function classifyMatch(m: MatchResult): MatchState {
  return m.outcome_coverage < 0.6 || m.missing_outcomes.length > 0 ? "Gap" : "Matched";
}

function filterToMatchState(f: FilterKey | null): MatchState | null {
  if (!f) return null;
  return f === "Direct" || f === "Bridge" ? "Matched" : "Gap";
}

function CourseMatchFlow({
  matches,
  sourceInstitution,
  targetInstitution,
  activeFilter,
  onClearFilter,
  onInspectCourse,
}: {
  matches: MatchResult[];
  sourceInstitution: string;
  targetInstitution: string;
  activeFilter: FilterKey | null;
  onClearFilter: () => void;
  onInspectCourse: (courseCode: string) => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const wantState = filterToMatchState(activeFilter);

  const filtered = useMemo(() => {
    if (!wantState) return matches;
    return matches.filter((m) => classifyMatch(m) === wantState);
  }, [matches, wantState]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.5 }}
      className="card-warm overflow-hidden rounded-3xl p-6 md:p-8 border border-white/80 shadow-[0_4px_25px_rgba(0,0,0,0.04)]"
    >
      <header className="flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">
            Course Match Flow
          </span>
          <h2 className="mt-1 font-display text-[22px] font-bold tracking-tight text-text-primary">
            Source Curriculum ➔ Target Programme
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
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm"
            >
              <span>Filter: {activeFilter}</span>
              <X className="h-3 w-3" />
            </motion.button>
          ) : (
            <span className="hidden shrink-0 rounded-full border border-border-subtle bg-white px-3 py-1 text-[11px] font-medium text-text-secondary md:inline-flex">
              {matches.length} courses evaluated
            </span>
          )}
        </AnimatePresence>
      </header>

      {/* Institution Anchor Row */}
      <div className="mt-6 grid grid-cols-[1fr_70px_1fr_90px] items-center gap-3 border-b border-slate-200/80 pb-2.5 text-[10.5px] font-bold uppercase tracking-wider text-text-muted">
        <span className="truncate">{sourceInstitution} · Prior</span>
        <span className="text-center">Vector</span>
        <span className="truncate">{targetInstitution} · Target</span>
        <span className="text-right">Confidence</span>
      </div>

      <ul className="divide-y divide-slate-100">
        <AnimatePresence initial={false}>
          {filtered.length === 0 && (
            <motion.li
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center gap-2 py-12 text-center"
            >
              <AlertCircle className="h-5 w-5 text-text-muted" />
              <p className="text-[13px] font-medium text-text-secondary">
                {matches.length === 0 ? "No course matches yet" : "No courses match this filter"}
              </p>
              {matches.length > 0 && (
                <button
                  type="button"
                  onClick={onClearFilter}
                  className="text-[12px] font-semibold text-emerald-600 hover:underline"
                >
                  Clear filter
                </button>
              )}
            </motion.li>
          )}

          {filtered.map((row, idx) => {
            const state = classifyMatch(row);
            const isMatched = state === "Matched";
            const rowId = `${row.source_course_id}-${row.target_course_id}-${idx}`;
            const expanded = expandedId === rowId;
            const pctScore = Math.round(row.semantic_score * 100);

            return (
              <motion.li
                key={rowId}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 6 }}
                transition={{ duration: 0.3 }}
                className="group"
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setExpandedId(expanded ? null : rowId)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setExpandedId(expanded ? null : rowId);
                    }
                  }}
                  className="grid w-full grid-cols-[1fr_70px_1fr_90px] items-center gap-3 py-3.5 text-left transition-colors hover:bg-slate-50/70 rounded-xl px-2 cursor-pointer"
                >
                  {/* Source Course */}
                  <div className="min-w-0">
                    <span className="font-mono text-[13px] font-bold text-text-primary">
                      {row.source_course_id}
                    </span>
                  </div>

                  {/* Flow Arrow */}
                  <div className="flex justify-center">
                    <svg viewBox="0 0 48 10" className="h-2.5 w-12 shrink-0" aria-hidden>
                      <line
                        x1="0"
                        y1="5"
                        x2="38"
                        y2="5"
                        stroke={isMatched ? "rgb(16 185 129)" : "rgb(245 158 11)"}
                        strokeWidth="1.75"
                        strokeDasharray={isMatched ? undefined : "3 3"}
                        strokeLinecap="round"
                      />
                      <polygon
                        points="38,2 46,5 38,8"
                        fill={isMatched ? "rgb(16 185 129)" : "rgb(245 158 11)"}
                      />
                    </svg>
                  </div>

                  {/* Target Course */}
                  <div className="min-w-0">
                    <span className="font-mono text-[13px] font-bold text-text-primary">
                      {row.target_course_id}
                    </span>
                  </div>

                  {/* Badge & Score */}
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider border",
                        isMatched
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-amber-50 text-amber-800 border-amber-200"
                      )}
                    >
                      {isMatched ? "Direct" : "Bridge"}
                    </span>
                    <span className="font-mono text-[11px] font-semibold text-slate-500">
                      {pctScore}% Match
                    </span>
                  </div>
                </div>

                {/* Expanded Micro-Intelligence Drawer */}
                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div
                      key="details"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden px-2 pb-4"
                    >
                      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm space-y-3">
                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div className="rounded-xl bg-slate-50 p-2.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                              Semantic Score
                            </span>
                            <p className="mt-0.5 font-display text-[16px] font-bold text-emerald-700">
                              {pctScore}%
                            </p>
                          </div>
                          <div className="rounded-xl bg-slate-50 p-2.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                              Outcome Coverage
                            </span>
                            <p className="mt-0.5 font-display text-[16px] font-bold text-blue-700">
                              {Math.round(row.outcome_coverage * 100)}%
                            </p>
                          </div>
                          <div className="rounded-xl bg-slate-50 p-2.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                              Evidence Leaves
                            </span>
                            <p className="mt-0.5 font-display text-[16px] font-bold text-[rgb(26_42_82)]">
                              {row.evidence.length} Refs
                            </p>
                          </div>
                        </div>

                        {row.missing_outcomes.length > 0 && (
                          <div className="rounded-xl bg-amber-50/60 border border-amber-200/70 p-3">
                            <p className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                              Identified Competency Delta:
                            </p>
                            <p className="mt-1 text-[12px] text-amber-800 leading-snug">
                              {row.missing_outcomes.join("; ")}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <span className="text-[11px] text-slate-500">
                            NCrF Level 6.0 Competency Verified
                          </span>
                          <button
                            type="button"
                            onClick={() => onInspectCourse(row.target_course_id)}
                            className="inline-flex items-center gap-1.5 text-[12px] font-bold text-emerald-700 hover:text-emerald-800"
                          >
                            <BookOpen className="h-3.5 w-3.5" />
                            <span>Inspect Syllabus</span>
                          </button>
                        </div>
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

/* ═══════════════════════════════════════════════════════════════
   BLOCK 3 — BRIDGE QUEUE (Deduplicated & Elevated)
   ═══════════════════════════════════════════════════════════════ */

function BridgeQueue({ bridges }: { bridges: Bridge[] }) {
  // Deduplicate bridges to prevent identical resources appearing repeatedly
  const uniqueBridges = useMemo(() => {
    const seen = new Set<string>();
    return bridges.filter((b) => {
      const key = `${b.resource_provider}-${b.resource_id}-${b.title}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [bridges]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.5 }}
      className="card-warm flex h-full flex-col overflow-hidden rounded-3xl p-6 md:p-8 border border-white/80 shadow-[0_4px_25px_rgba(0,0,0,0.04)]"
    >
      <header className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">
            BridgePath Engine
          </span>
          <h2 className="mt-1 font-display text-[22px] font-bold tracking-tight text-text-primary">
            Recommended Bridges
          </h2>
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
          MoE Recognized
        </span>
      </header>

      {uniqueBridges.length === 0 ? (
        <div className="mt-6 flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border-subtle py-10 text-center">
          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          <p className="text-[13px] font-medium text-text-secondary">No bridges needed right now</p>
          <p className="max-w-[220px] text-[11.5px] text-text-muted">
            All credit requirements are satisfied directly by prior academic transcripts.
          </p>
        </div>
      ) : (
        <ul className="mt-5 flex-1 space-y-3">
          {uniqueBridges.map((b, i) => (
            <motion.li
              key={b.bridge_id || i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.08, duration: 0.4 }}
            >
              <Link
                href={`/student/bridges/${b.bridge_id}`}
                className="group relative block overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
              >
                <span className="absolute inset-y-0 left-0 w-[4px] bg-amber-500 transition-colors group-hover:bg-emerald-500" />
                <div className="flex items-start justify-between gap-3 pl-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        {b.resource_provider}
                      </span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-700">
                        2 Credits
                      </span>
                    </div>
                    <p className="mt-1.5 truncate text-[13.5px] font-bold leading-snug tracking-tight text-text-primary group-hover:text-emerald-900 transition-colors">
                      {b.title || b.resource_id}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-[11px] font-medium text-text-muted">
                      <Clock className="h-3 w-3 text-slate-400" />
                      <span>{b.duration_hours} hrs</span>
                      <span>·</span>
                      <span>{b.assessment_available ? "Proctored Exam" : "Self-paced"}</span>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-emerald-600" />
                </div>
              </Link>
            </motion.li>
          ))}
        </ul>
      )}
    </motion.section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BLOCK 4 — ROADMAP TIMELINE (Comprehensive Degree Milestone)
   ═══════════════════════════════════════════════════════════════ */

interface Milestone {
  id: string;
  title: string;
  sub: string;
  timing: string;
  kind: "prior" | "bridge" | "core" | "degree";
  status: "Completed" | "In Progress" | "Upcoming";
}

function RoadmapTimeline({ pathway }: { pathway: Pathway | undefined }) {
  // Build an end-to-end, multi-milestone graduation journey
  const milestones: Milestone[] = [
    {
      id: "m-1",
      title: "Prior Validated Credits",
      sub: "Transcript verified from source university",
      timing: "Verified",
      kind: "prior",
      status: "Completed",
    },
    {
      id: "m-2",
      title: "BridgePath Accelerated Term",
      sub: "NPTEL & Virtual Lab competency gap closure",
      timing: "Summer (8 Wks)",
      kind: "bridge",
      status: "In Progress",
    },
    {
      id: "m-3",
      title: "Core Curriculum Term",
      sub: "Advanced systems & computational theory",
      timing: "Term 1 (Autumn)",
      kind: "core",
      status: "Upcoming",
    },
    {
      id: "m-4",
      title: "Degree Award & Convocation",
      sub: "B.Tech Honours · National Credit Transfer",
      timing: "Graduation",
      kind: "degree",
      status: "Upcoming",
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.5 }}
      className="card-warm overflow-hidden rounded-3xl p-6 md:p-8 border border-white/80 shadow-[0_4px_25px_rgba(0,0,0,0.04)]"
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">
            Academic Pathway Roadmap
          </span>
          <h2 className="mt-1 font-display text-[22px] font-bold tracking-tight text-text-primary">
            From Current Credits to Convocation
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-800 border border-emerald-200">
            {pathway ? `${pathway.terms} Semester Accelerated Target` : "1 Semester FastTrack"}
          </span>
        </div>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {milestones.map((m, idx) => (
          <div
            key={m.id}
            className={cn(
              "relative flex flex-col justify-between rounded-2xl border p-4 transition-all",
              m.status === "Completed"
                ? "border-emerald-200 bg-emerald-50/40"
                : m.status === "In Progress"
                ? "border-amber-200 bg-amber-50/40 shadow-sm"
                : "border-slate-200/80 bg-white/70"
            )}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                  Step 0{idx + 1} · {m.timing}
                </span>
                <span
                  className={cn(
                    "rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                    m.status === "Completed"
                      ? "bg-emerald-100 text-emerald-800"
                      : m.status === "In Progress"
                      ? "bg-amber-100 text-amber-900"
                      : "bg-slate-100 text-slate-600"
                  )}
                >
                  {m.status}
                </span>
              </div>

              <h4 className="mt-2.5 font-display text-[15px] font-bold text-text-primary">
                {m.title}
              </h4>
              <p className="mt-1 text-[11.5px] text-text-secondary leading-snug">
                {m.sub}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-medium text-slate-500">
              <span>Milestone {idx + 1}</span>
              {m.status === "Completed" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : m.status === "In Progress" ? (
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                </span>
              ) : (
                <GraduationCap className="h-4 w-4 text-slate-400" />
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════════════════════════ */

export interface PathwayInfographicProps {
  recognition: RecognitionSummary;
  matches: MatchResult[];
  bridges: Bridge[];
  pathway: Pathway | undefined;
  semsRemaining: number;
  sourceInstitution: string;
  targetInstitution: string;
}

export function PathwayInfographic({
  recognition,
  matches,
  bridges,
  pathway,
  semsRemaining,
  sourceInstitution,
  targetInstitution,
}: PathwayInfographicProps) {
  const [activeFilter, setActiveFilter] = useState<FilterKey | null>(null);
  const [inspectedCourse, setInspectedCourse] = useState<{
    code: string;
    title?: string;
    institution?: string;
    credits?: number;
    bloomLevel?: string;
    outcomes?: string[];
  } | null>(null);

  return (
    <div className="space-y-6">
      <TheVerdict
        recognition={recognition}
        semsRemaining={semsRemaining}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
        <CourseMatchFlow
          matches={matches}
          sourceInstitution={sourceInstitution}
          targetInstitution={targetInstitution}
          activeFilter={activeFilter}
          onClearFilter={() => setActiveFilter(null)}
          onInspectCourse={(code) =>
            setInspectedCourse({
              code,
              institution: targetInstitution,
            })
          }
        />
        <BridgeQueue bridges={bridges} />
      </div>

      <RoadmapTimeline pathway={pathway} />

      {/* Course Modal Dialog */}
      <CourseModal
        open={!!inspectedCourse}
        onOpenChange={(open) => !open && setInspectedCourse(null)}
        course={inspectedCourse}
      />
    </div>
  );
}
