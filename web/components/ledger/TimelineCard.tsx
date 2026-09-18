"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  User,
  MoreVertical,
} from "lucide-react";
import type { LedgerEvent } from "@/lib/constants/demo-ledger";
import { cn } from "@/lib/utils/cn";

interface TimelineCardProps {
  event: LedgerEvent;
  index: number;
}

const ICON_MAP = {
  check: CheckCircle2,
  sparkle: Sparkles,
  warn: AlertTriangle,
  user: User,
} as const;

export function TimelineCard({ event, index }: TimelineCardProps) {
  const Icon = ICON_MAP[event.icon];
  const isAmber = event.highlight;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.15 + index * 0.08,
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={cn(
        "relative rounded-2xl border px-5 py-4 backdrop-blur-sm transition-shadow",
        isAmber
          ? "border-amber-400/70 bg-amber-50/60 shadow-[0_8px_28px_-8px_rgb(245_158_11_/_0.35)]"
          : "border-border-subtle bg-white/85 shadow-sm hover:shadow-md"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
            isAmber
              ? "bg-amber-100 text-amber-600"
              : "bg-slate-100 text-slate-600"
          )}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={2.1} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[15px] font-bold leading-tight tracking-tight text-text-primary">
              {event.title}
            </h3>
            {event.badge && (
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                  event.badge.tone === "amber"
                    ? "bg-amber-200/80 text-amber-900"
                    : "bg-slate-100 text-slate-600"
                )}
              >
                {event.badge.label}
              </span>
            )}
            {isAmber && (
              <button
                className="ml-auto flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="More options"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <p className="mt-1.5 text-[13px] leading-snug text-text-secondary">
            {event.subtitle}
          </p>

          {event.rightLabel && (
            <p className="mt-1 font-mono text-[11px] text-text-muted">
              {event.rightLabel}
            </p>
          )}

          {event.overlay && (
            <div className="mt-3">
              <span className="inline-flex rounded-full border border-amber-300/70 bg-amber-100/70 px-3 py-1 text-[11px] font-semibold text-amber-900">
                {event.overlay}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}