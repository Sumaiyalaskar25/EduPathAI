"use client";

import { motion } from "framer-motion";
import { GraduationCap, Landmark, ShieldCheck, Check, Sparkles } from "lucide-react";
import { IDENTITY_OPTIONS, type IdentityMode } from "@/lib/constants/auth-ui";
import { cn } from "@/lib/utils/cn";

interface Props {
  selected: IdentityMode;
  onChange: (mode: IdentityMode) => void;
  personasCount?: {
    learner: number;
    bos: number;
    ministry: number;
  };
}

const ROLE_ICONS: Record<IdentityMode, React.ComponentType<{ className?: string }>> = {
  learner: GraduationCap,
  bos: Landmark,
  ministry: ShieldCheck,
};

const ROLE_BADGES: Record<IdentityMode, { label: string; color: string }> = {
  learner: { label: "Learner Gateway", color: "bg-blue-500/10 text-blue-700 border-blue-200" },
  bos: { label: "Institutional Portal", color: "bg-purple-500/10 text-purple-700 border-purple-200" },
  ministry: { label: "National Policy Console", color: "bg-emerald-500/10 text-emerald-700 border-emerald-200" },
};

export function IdentityModeSelector({ selected, onChange, personasCount }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      className="glass-strong relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-white/60 p-7 shadow-[0_12px_36px_-12px_rgb(0_0_0_/_0.06)] md:p-8"
    >
      {/* Decorative gradient corner */}
      <div className="pointer-events-none absolute -left-16 -top-16 h-36 w-36 rounded-full bg-blue-300/15 blur-2xl" />

      <div>
        <header className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.16em] text-slate-700">
              <span>Step 1</span>
              <span className="text-slate-400">·</span>
              <span>Access Control</span>
            </div>
            <h2 className="mt-2.5 font-display text-[25px] font-bold tracking-tight text-text-primary">
              Identity Mode Selection
            </h2>
            <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
              Select your authorization level to access academic mobility services.
            </p>
          </div>
        </header>

        <div className="mt-6 flex flex-col gap-3">
          {IDENTITY_OPTIONS.map((opt, i) => {
            const active = opt.key === selected;
            const Icon = ROLE_ICONS[opt.key];
            const badge = ROLE_BADGES[opt.key];
            const count = personasCount ? personasCount[opt.key] : 0;

            return (
              <motion.button
                key={opt.key}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.08, duration: 0.4 }}
                onClick={() => onChange(opt.key)}
                className={cn(
                  "group relative flex items-start gap-4 rounded-2xl p-4 text-left transition-all duration-300",
                  active
                    ? "border-2 border-[rgb(26_42_82)] bg-gradient-to-br from-[rgb(26_42_82)] to-[rgb(34_54_102)] text-white shadow-[0_16px_36px_-12px_rgb(26_42_82_/_0.4)]"
                    : "border border-border-subtle bg-white/80 text-text-primary hover:border-slate-300 hover:bg-white hover:shadow-sm"
                )}
              >
                {/* Role Icon Box */}
                <div
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors duration-200",
                    active
                      ? "bg-white/15 text-white"
                      : "border border-slate-200 bg-slate-50 text-[rgb(26_42_82)] group-hover:bg-slate-100"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p
                      className={cn(
                        "text-[14.5px] font-bold tracking-tight",
                        active ? "text-white" : "text-text-primary"
                      )}
                    >
                      {opt.label}
                    </p>
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide",
                        active
                          ? "border-white/20 bg-white/10 text-white/90"
                          : badge.color
                      )}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <p
                    className={cn(
                      "mt-1 text-[12px] leading-relaxed",
                      active ? "text-white/80" : "text-text-secondary"
                    )}
                  >
                    {opt.description}
                  </p>

                  {count > 0 && (
                    <div className="mt-2.5 flex items-center gap-1.5">
                      <span className={cn(
                        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10.5px] font-medium",
                        active ? "bg-white/15 text-emerald-300" : "bg-emerald-50 text-emerald-700"
                      )}>
                        <Sparkles className="h-3 w-3" />
                        {count} Verified {count === 1 ? "Profile" : "Profiles"} Available
                      </span>
                    </div>
                  )}
                </div>

                {/* Radio selection circle */}
                <div
                  className={cn(
                    "relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 mt-1",
                    active
                      ? "border-emerald-400 bg-emerald-400"
                      : "border-slate-300 bg-white group-hover:border-slate-400"
                  )}
                >
                  {active && (
                    <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 text-[11px] leading-relaxed text-text-muted">
        <p className="flex items-center gap-1.5 font-medium text-text-secondary">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Role-Based Access Governance</span>
        </p>
        <p className="mt-1">
          Your active identity scopes data access and automatically records approval / review actions on the cryptographic audit ledger.
        </p>
      </div>
    </motion.div>
  );
}