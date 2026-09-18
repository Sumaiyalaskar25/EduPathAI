"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { OutcomeRow } from "@/lib/constants/demo-gaps";
import { cn } from "@/lib/utils/cn";

interface OutcomeDeltaTableProps {
  rows: OutcomeRow[];
}

export function OutcomeDeltaTable({ rows }: OutcomeDeltaTableProps) {
  return (
    <div className="card-warm overflow-hidden p-0">
      <div className="border-b border-border-subtle px-6 py-4">
        <h2 className="text-[16px] font-bold tracking-tight text-text-primary">
          Curriculum Outcome Delta
        </h2>
      </div>

      <ul className="divide-y divide-border-subtle/70">
        {rows.map((row, i) => (
          <motion.li
            key={row.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.04, duration: 0.4 }}
            className="px-6 py-4"
          >
            <div className="grid grid-cols-[20px_1fr_24px_1fr] items-center gap-4">
              <span className="text-[14px] font-medium text-text-muted">
                {row.id}.
              </span>
              <span className="text-[15px] font-medium text-text-primary">
                {row.sourceTopic}
              </span>
              <ArrowRight className="h-4 w-4 justify-self-center text-text-muted" />
              <span
                className={cn(
                  "justify-self-start rounded-md px-3 py-1.5 text-[14px] font-semibold",
                  row.status === "gap"
                    ? "bg-amber-100 text-amber-900"
                    : "text-text-primary"
                )}
              >
                {row.targetTopic}
              </span>
            </div>

            {(row.matchBadge || row.gapBadge) && (
              <div className="mt-3 grid grid-cols-[20px_1fr_24px_1fr] gap-4">
                <span />
                <span
                  className={cn(
                    "justify-self-start rounded-full px-2.5 py-1 text-[10.5px] font-semibold",
                    row.matchBadge &&
                      "bg-emerald-100 text-emerald-800"
                  )}
                >
                  {row.matchBadge}
                </span>
                <span />
                <span
                  className={cn(
                    "justify-self-start rounded-full px-2.5 py-1 text-[10.5px] font-semibold",
                    row.gapBadge && "bg-amber-200/80 text-amber-900"
                  )}
                >
                  {row.gapBadge}
                </span>
              </div>
            )}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}