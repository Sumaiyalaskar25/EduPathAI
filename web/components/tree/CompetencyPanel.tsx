"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Check, ArrowRight } from "lucide-react";
import { DEMO_COMPETENCY } from "@/lib/constants/demo-tree";
import { cn } from "@/lib/utils/cn";

export function CompetencyPanel() {
  const satisfiedCount = DEMO_COMPETENCY.prereqs.filter(
    (p) => p.satisfied
  ).length;

  return (
    <motion.aside
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="card-warm flex h-full flex-col p-6"
    >
      <h2 className="text-[19px] font-bold leading-tight tracking-tight text-text-primary">
        Competency Node:
        <br />
        <span className="text-gradient-navy">{DEMO_COMPETENCY.title}</span>
      </h2>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-amber-900">
          <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2.4} />
          {DEMO_COMPETENCY.badge}
        </span>
        <span className="text-[11px] font-medium text-text-secondary">
          ({DEMO_COMPETENCY.coverage})
        </span>
      </div>

      <div className="mt-6 rounded-2xl border border-border-subtle bg-white/70 p-5">
        <h3 className="text-[14px] font-bold tracking-tight text-text-primary">
          Prerequisites &amp; Alignment
        </h3>

        <p className="mt-3 flex items-center gap-2 text-[13px] font-semibold text-emerald-800">
          <Check
            className="h-4 w-4 rounded-full bg-emerald-600 p-0.5 text-white"
            strokeWidth={3}
          />
          Direct prerequisites satisfied ({satisfiedCount}/
          {DEMO_COMPETENCY.prereqs.length})
        </p>

        <ul className="mt-2 space-y-2 pl-6">
          {DEMO_COMPETENCY.prereqs.map((p) => (
            <li
              key={p.label}
              className="flex items-center gap-2 text-[13px] font-medium text-text-primary"
            >
              <span
                className={cn(
                  "flex h-4 w-4 items-center justify-center rounded-full",
                  p.satisfied
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-200 text-slate-500"
                )}
              >
                <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
              </span>
              {p.label}
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-start gap-2 border-t border-border-subtle pt-3 text-[12.5px] leading-snug text-text-secondary">
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-slate-300" />
          <div>
            <span className="font-semibold text-text-primary">
              Course Equivalency Gap:{" "}
            </span>
            Consensus protocols (Paxos/Raft)
          </div>
        </div>
      </div>

      <button className="mt-auto flex w-full items-center justify-between gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-700 px-5 py-3.5 text-[13px] font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5">
        <span>{DEMO_COMPETENCY.cta}</span>
        <ArrowRight className="h-4 w-4" />
      </button>
    </motion.aside>
  );
}