"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Target,
  Sparkles,
  Layers,
  BookOpen,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import type { Gap, Bridge } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";

const GAP_TYPE_LABEL: Record<Gap["gap_type"], string> = {
  KNOWLEDGE: "Knowledge Gap",
  PREREQUISITE: "Prerequisite Gap",
  ASSESSMENT: "Assessment Gap",
  ADMINISTRATIVE: "Administrative Gap",
};

export function CompetencyPanel({ gaps, bridges }: { gaps: Gap[]; bridges: Bridge[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!gaps || gaps.length === 0) {
    return (
      <motion.aside
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="card-warm flex h-full flex-col items-center justify-center gap-3 p-6 text-center border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-sm">
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <h2 className="text-[17px] font-bold tracking-tight text-text-primary">100% Competencies Matched</h2>
        <p className="max-w-[240px] text-[12.5px] leading-relaxed text-text-secondary">
          Every required outcome in the target curriculum is satisfied by direct recognition or approved bridging pathways.
        </p>
      </motion.aside>
    );
  }

  const activeIndex = Math.min(selectedIndex, gaps.length - 1);
  const gap = gaps[activeIndex];
  const bridge = gap ? bridges.find((b) => b.gap_id === gap.gap_id) : undefined;

  return (
    <motion.aside
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="card-warm relative overflow-hidden flex h-full flex-col p-6 border border-white/80 shadow-[0_4px_25px_rgba(0,0,0,0.04)]"
    >
      {/* Header with Multi-Gap Navigation */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            Competency Delta
          </span>
          <h2 className="mt-2 text-[19px] font-bold leading-tight tracking-tight text-text-primary">
            {GAP_TYPE_LABEL[gap.gap_type]}
          </h2>
        </div>

        {gaps.length > 1 && (
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            <button
              type="button"
              onClick={() => setSelectedIndex((prev) => Math.max(0, prev - 1))}
              disabled={activeIndex === 0}
              className="p-1 rounded-lg text-slate-600 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              aria-label="Previous gap"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="font-mono text-[11px] font-bold text-slate-700 px-1.5">
              {activeIndex + 1}/{gaps.length}
            </span>
            <button
              type="button"
              onClick={() => setSelectedIndex((prev) => Math.min(gaps.length - 1, prev + 1))}
              disabled={activeIndex === gaps.length - 1}
              className="p-1 rounded-lg text-slate-600 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              aria-label="Next gap"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Gap Tabs Selector */}
      {gaps.length > 1 && (
        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
          {gaps.map((g, idx) => (
            <button
              key={g.gap_id || idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={cn(
                "rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all shrink-0",
                activeIndex === idx
                  ? "bg-slate-900 text-white shadow-sm font-semibold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              Gap #{idx + 1}
            </button>
          ))}
        </div>
      )}

      {/* Main Gap Detail Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={gap.gap_id || activeIndex}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="mt-4 flex-1 space-y-4"
        >
          <div className="rounded-2xl border border-border-subtle bg-white/80 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-[13.5px] font-bold tracking-tight text-text-primary">
                <Target className="h-4 w-4 text-amber-600" />
                <span>Learning Outcome Gap</span>
              </h3>
              <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                Action Required
              </span>
            </div>

            <p className="mt-3 text-[13px] leading-relaxed text-text-secondary">
              {gap.description}
            </p>

            {gap.missing_outcomes.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <p className="text-[10.5px] font-bold uppercase tracking-wider text-text-muted">
                  Specific Learning Competencies:
                </p>
                <ul className="mt-2.5 space-y-2">
                  {gap.missing_outcomes.map((outcome, i) => (
                    <li key={i} className="flex items-start gap-2 text-[12px] leading-snug text-text-primary">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Linked Bridge Card */}
          {bridge ? (
            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4">
              <div className="flex items-center gap-1.5 text-emerald-800">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Recommended Remedy
                </span>
              </div>
              <p className="mt-1 text-[13px] font-bold text-text-primary truncate">
                {bridge.title || bridge.resource_id}
              </p>
              <div className="mt-1.5 flex items-center gap-2 text-[11px] text-text-secondary">
                <span className="font-semibold text-emerald-700">{bridge.resource_provider}</span>
                <span>·</span>
                <span>{bridge.duration_hours} hrs</span>
                <span>·</span>
                <span>{bridge.assessment_available ? "Proctored Exam" : "Self-paced"}</span>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-[12px] text-text-secondary">
              No automated bridge found. Will be reviewed manually by the Board of Studies.
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* CTA Button */}
      <div className="mt-5 pt-3 border-t border-slate-100">
        {bridge ? (
          <Link
            href={`/student/bridges/${bridge.bridge_id}`}
            className="flex w-full items-center justify-between gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-5 py-3 text-[13px] font-semibold text-white shadow-md shadow-emerald-700/20 transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            <span>Resolve via Bridge Module</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <Link
            href="/student/gaps"
            className="flex w-full items-center justify-between gap-2 rounded-xl bg-[rgb(26_42_82)] px-5 py-3 text-[13px] font-semibold text-white shadow-md transition-all hover:bg-[rgb(36_56_105)]"
          >
            <span>Review Full Gap Matrix</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </motion.aside>
  );
}
