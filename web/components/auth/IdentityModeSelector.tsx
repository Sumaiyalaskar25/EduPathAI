"use client";

import { motion } from "framer-motion";
import {
  IDENTITY_OPTIONS,
  type IdentityMode,
} from "@/lib/constants/demo-auth";
import { cn } from "@/lib/utils/cn";

interface Props {
  selected: IdentityMode;
  onChange: (mode: IdentityMode) => void;
}

export function IdentityModeSelector({ selected, onChange }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      className="glass-strong flex h-full flex-col rounded-3xl p-7 md:p-9"
    >
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
          Step 1
        </p>
        <h2 className="mt-1.5 font-display text-[24px] font-bold tracking-tight text-text-primary">
          Identity Mode Selection
        </h2>
        <p className="mt-2 text-[13px] leading-snug text-text-secondary">
          Choose how you're accessing the platform.
        </p>
      </header>

      <div className="mt-7 flex flex-1 flex-col gap-3">
        {IDENTITY_OPTIONS.map((opt, i) => {
          const active = opt.key === selected;
          return (
            <motion.button
              key={opt.key}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.07, duration: 0.4 }}
              onClick={() => onChange(opt.key)}
              className={cn(
                "group relative flex items-center gap-3 overflow-hidden rounded-2xl px-5 py-4 text-left transition-all duration-200",
                active
                  ? "bg-[rgb(26_42_82)] text-white shadow-[0_16px_36px_-14px_rgb(26_42_82_/_0.55)]"
                  : "border border-border-subtle bg-white/70 text-text-primary hover:border-[rgb(26_42_82)]/25 hover:bg-white"
              )}
            >
              <div className="flex-1">
                <p
                  className={cn(
                    "text-[14px] font-semibold tracking-tight",
                    active && "text-white"
                  )}
                >
                  {opt.label}
                </p>
                <p
                  className={cn(
                    "mt-0.5 text-[11.5px] leading-snug",
                    active ? "text-white/70" : "text-text-secondary"
                  )}
                >
                  {opt.description}
                </p>
              </div>

              {/* Radio indicator */}
              <span
                className={cn(
                  "relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  active
                    ? "border-white/90 bg-white/15"
                    : "border-border-strong bg-white"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="identity-dot"
                    className="h-2.5 w-2.5 rounded-full bg-emerald-400"
                    transition={{ type: "spring", damping: 24, stiffness: 320 }}
                  />
                )}
              </span>
            </motion.button>
          );
        })}
      </div>

      <p className="mt-6 text-[11px] leading-snug text-text-muted">
        Your selection determines what data you can access. All actions are
        logged on the tamper-evident audit ledger.
      </p>
    </motion.div>
  );
}