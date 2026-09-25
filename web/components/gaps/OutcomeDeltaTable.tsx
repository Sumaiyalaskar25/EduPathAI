"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, AlertTriangle, Sparkles, BookOpen } from "lucide-react";
import type { OutcomeRow } from "@/lib/constants/demo-gaps";
import { cn } from "@/lib/utils/cn";

interface OutcomeDeltaTableProps {
  rows: OutcomeRow[];
  onInspectCourse?: (code: string) => void;
}

export function OutcomeDeltaTable({ rows, onInspectCourse }: OutcomeDeltaTableProps) {
  return (
    <div className="card-warm overflow-hidden rounded-3xl p-6 border border-white/80 shadow-[0_4px_25px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">
            Curriculum Alignment
          </span>
          <h2 className="mt-1 font-display text-[20px] font-bold tracking-tight text-text-primary">
            Curriculum Outcome Delta Matrix
          </h2>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700">
          {rows.length} outcomes analyzed
        </span>
      </div>

      <ul className="mt-4 divide-y divide-slate-100 space-y-3">
        {rows.map((row, i) => {
          const isDirect = row.status === "match";

          return (
            <motion.li
              key={row.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.04, duration: 0.35 }}
              className="pt-3.5 first:pt-0"
            >
              <div className="group rounded-2xl border border-slate-200/80 bg-white/85 p-4 transition-all hover:border-emerald-300 hover:shadow-sm">
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-600">
                      #{row.id}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border",
                        isDirect
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-amber-50 text-amber-800 border-amber-200"
                      )}
                    >
                      {isDirect ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          <span>Direct Recognition</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-3 w-3 text-amber-600" />
                          <span>Bridge Required</span>
                        </>
                      )}
                    </span>
                  </div>

                  {onInspectCourse && (
                    <button
                      type="button"
                      onClick={() => onInspectCourse(row.targetTopic.split(" · ")[0])}
                      className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <BookOpen className="h-3 w-3" />
                      <span>Inspect Target</span>
                    </button>
                  )}
                </div>

                {/* Course vector comparison */}
                <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <div className="rounded-xl bg-slate-50 p-2.5">
                    <span className="text-[9.5px] font-bold uppercase tracking-wider text-text-muted block">
                      Prior Learning
                    </span>
                    <p className="mt-0.5 text-[13px] font-bold text-text-primary">
                      {row.sourceTopic}
                    </p>
                  </div>

                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>

                  <div className={cn(
                    "rounded-xl p-2.5",
                    isDirect ? "bg-emerald-50/60 border border-emerald-100" : "bg-amber-50/60 border border-amber-100"
                  )}>
                    <span className="text-[9.5px] font-bold uppercase tracking-wider text-text-muted block">
                      Target Curriculum
                    </span>
                    <p className={cn(
                      "mt-0.5 text-[13px] font-bold",
                      isDirect ? "text-emerald-950" : "text-amber-950"
                    )}>
                      {row.targetTopic}
                    </p>
                  </div>
                </div>

                {/* Badge / Delta description */}
                {(row.matchBadge || row.gapBadge) && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11.5px]">
                    {row.matchBadge && (
                      <p className="font-medium text-emerald-800 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>{row.matchBadge}</span>
                      </p>
                    )}
                    {row.gapBadge && (
                      <p className="font-medium text-amber-800 flex items-start gap-1.5">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                        <span>{row.gapBadge}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}