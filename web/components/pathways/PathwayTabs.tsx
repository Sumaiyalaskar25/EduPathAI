"use client";

import { motion } from "framer-motion";
import type { PathwayMode } from "@/lib/api/types";
import type { PathwayOption } from "@/lib/view-models/pathway";
import { cn } from "@/lib/utils/cn";

interface PathwayTabsProps {
  options: PathwayOption[];
  selected: PathwayMode;
  onSelect: (key: PathwayMode) => void;
}

export function PathwayTabs({ options, selected, onSelect }: PathwayTabsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {options.map((opt, i) => {
        const active = opt.key === selected;
        return (
          <motion.button
            key={opt.key}
            onClick={() => onSelect(opt.key)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            className={cn(
              "relative flex flex-col rounded-2xl border px-5 py-4 text-left transition-all duration-200",
              active
                ? "border-2 border-sky-700/70 bg-white shadow-[0_16px_40px_-16px_rgb(26_42_82_/_0.35)] -translate-y-0.5"
                : "border border-border-subtle bg-white/70 hover:bg-white"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-[17px] font-bold tracking-tight text-text-primary">
                {opt.title}
              </h3>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-semibold",
                  active
                    ? "bg-slate-100 text-slate-700"
                    : "bg-slate-100 text-slate-600"
                )}
              >
                {opt.creditLine}
              </span>
            </div>
            <p className="mt-1.5 text-[12.5px] font-medium leading-snug text-text-secondary">
              {opt.subtitle}
            </p>
          </motion.button>
        );
      })}
    </div>
  );
}