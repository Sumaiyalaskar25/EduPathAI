"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScrollText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Users,
  Building2,
  FileText,
  Download,
  Sparkles,
  Target,
  Filter,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { BottomStrip } from "@/components/layout/BottomStrip";
import { GOV_NAV } from "@/components/layout/Sidebar";
import {
  DEMO_COMPLIANCE_PILLARS,
  DEMO_POLICY_BRIEFS,
  DEMO_POLICY_STATS,
  type CompliancePillar,
  type PolicyBrief,
} from "@/lib/constants/demo-gov-policy";
import { DEMO_CHAIN } from "@/lib/constants/demo";
import { cn } from "@/lib/utils/cn";

/* ───── helpers ───── */

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function formatNum(n: number): string {
  if (n >= 10_000_000) return `${(n / 10_000_000).toFixed(1)}Cr`;
  if (n >= 100_000) return `${(n / 100_000).toFixed(1)}L`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

/* ───── 1. HERO STATS ───── */

function HeroStats() {
  const items: {
    label: string;
    value: string | number;
    tone: "emerald" | "amber" | "navy";
    Icon: typeof Users;
  }[] = [
    { label: "Overall compliance", value: pct(DEMO_POLICY_STATS.overallCompliance), tone: "emerald", Icon: Target },
    { label: "Active policy briefs", value: DEMO_POLICY_STATS.activeBriefs, tone: "amber", Icon: FileText },
    { label: "HEIs covered", value: formatNum(DEMO_POLICY_STATS.heisCovered), tone: "navy", Icon: Building2 },
    { label: "Students benefited", value: formatNum(DEMO_POLICY_STATS.studentsBenefited), tone: "emerald", Icon: Users },
  ];

  const toneMap = {
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    navy: "text-[rgb(26_42_82)]",
  };

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {items.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 + i * 0.06, duration: 0.45 }}
          className="card-warm p-5"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-text-muted">
              {s.label}
            </span>
            <s.Icon className={cn("h-4 w-4", toneMap[s.tone])} />
          </div>
          <p
            className={cn(
              "mt-3 font-display text-[30px] font-bold leading-none tracking-tight tabular-nums",
              toneMap[s.tone]
            )}
          >
            {s.value}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

/* ───── 2. COMPLIANCE PILLARS ───── */

const PILLAR_STYLE: Record<
  CompliancePillar["status"],
  { bg: string; fg: string; label: string; Icon: typeof CheckCircle2 }
> = {
  "on-track": { bg: "bg-emerald-100", fg: "text-emerald-800", label: "On track", Icon: CheckCircle2 },
  attention: { bg: "bg-amber-100", fg: "text-amber-900", label: "Attention", Icon: AlertTriangle },
  behind: { bg: "bg-rose-100", fg: "text-rose-800", label: "Behind", Icon: XCircle },
};

function CompliancePillars() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.5 }}
      className="card-warm rounded-3xl p-7"
    >
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
            NEP 2020 Alignment
          </p>
          <h2 className="mt-1.5 font-display text-[20px] font-bold tracking-tight text-text-primary">
            Compliance pillars
          </h2>
          <p className="mt-1.5 max-w-xl text-[12px] leading-snug text-text-secondary">
            Six dimensions of framework compliance, measured against NEP 2020
            targets and updated from live audit ledger data.
          </p>
        </div>
      </header>

      <ul className="mt-6 grid gap-3 md:grid-cols-2">
        {DEMO_COMPLIANCE_PILLARS.map((p, i) => {
          const s = PILLAR_STYLE[p.status];
          const StatusIcon = s.Icon;
          const delta = p.score - p.target;
          return (
            <motion.li
              key={p.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 + i * 0.04, duration: 0.4 }}
              className="rounded-2xl border border-border-subtle bg-white/70 p-5 transition-all hover:border-emerald-200 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[13.5px] font-bold tracking-tight text-text-primary">
                    {p.label}
                  </p>
                  <p className="mt-1 text-[11.5px] leading-snug text-text-secondary">
                    {p.description}
                  </p>
                </div>
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider",
                    s.bg,
                    s.fg
                  )}
                >
                  <StatusIcon className="h-2.5 w-2.5" />
                  {s.label}
                </span>
              </div>

              <div className="mt-4">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-[18px] font-bold tabular-nums text-text-primary">
                    {pct(p.score)}
                  </span>
                  <span className="text-[11px] font-medium text-text-muted">
                    target {pct(p.target)}
                  </span>
                </div>

                {/* Progress bar with target marker */}
                <div className="relative mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${p.score * 100}%` }}
                    transition={{
                      delay: 0.55 + i * 0.04,
                      duration: 0.8,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className={cn(
                      "h-full rounded-full",
                      delta >= 0 ? "bg-emerald-500" : "bg-amber-500"
                    )}
                  />
                  {/* Target marker */}
                  <div
                    className="absolute top-0 h-full w-[2px] bg-[rgb(26_42_82)]"
                    style={{ left: `${p.target * 100}%` }}
                    aria-hidden
                  />
                </div>

                <p
                  className={cn(
                    "mt-1.5 text-[10.5px] font-semibold tabular-nums",
                    delta >= 0 ? "text-emerald-700" : "text-amber-700"
                  )}
                >
                  {delta >= 0 ? "+" : ""}
                  {Math.round(delta * 100)} pts vs target
                </p>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </motion.section>
  );
}

/* ───── 3. POLICY BRIEFS ───── */

type PriorityFilter = "ALL" | "high" | "medium" | "low";

const PRIORITY_STYLE: Record<
  PolicyBrief["priority"],
  { bg: string; fg: string; label: string }
> = {
  high: { bg: "bg-rose-100", fg: "text-rose-800", label: "High priority" },
  medium: { bg: "bg-amber-100", fg: "text-amber-900", label: "Medium" },
  low: { bg: "bg-emerald-100", fg: "text-emerald-800", label: "Low" },
};

function PolicyBriefs() {
  const [filter, setFilter] = useState<PriorityFilter>("ALL");

  const counts = {
    ALL: DEMO_POLICY_BRIEFS.length,
    high: DEMO_POLICY_BRIEFS.filter((b) => b.priority === "high").length,
    medium: DEMO_POLICY_BRIEFS.filter((b) => b.priority === "medium").length,
    low: DEMO_POLICY_BRIEFS.filter((b) => b.priority === "low").length,
  };

  const visible =
    filter === "ALL"
      ? DEMO_POLICY_BRIEFS
      : DEMO_POLICY_BRIEFS.filter((b) => b.priority === filter);

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="card-warm rounded-3xl p-7"
    >
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
            Auto-Generated Briefs
          </p>
          <h2 className="mt-1.5 font-display text-[20px] font-bold tracking-tight text-text-primary">
            Policy signals &amp; recommendations
          </h2>
          <p className="mt-1.5 max-w-xl text-[12px] leading-snug text-text-secondary">
            Weekly-generated briefs from aggregate recognition patterns.
            Privacy-preserving, anonymized, ready for ministry circulation.
          </p>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-canvas">
            <Filter className="h-3.5 w-3.5 text-text-muted" />
          </span>
          {(["ALL", "high", "medium", "low"] as PriorityFilter[]).map((p) => {
            const isActive = filter === p;
            const label = p === "ALL" ? "All" : PRIORITY_STYLE[p].label;
            return (
              <button
                key={p}
                onClick={() => setFilter(p)}
                className={cn(
                  "flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11.5px] font-semibold transition-all",
                  isActive
                    ? "bg-[rgb(26_42_82)] text-white shadow-[0_8px_20px_-8px_rgb(26_42_82_/_0.5)]"
                    : "border border-border-subtle bg-white/70 text-text-secondary hover:bg-white hover:text-text-primary"
                )}
              >
                <span>{label}</span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[9.5px] font-bold tabular-nums",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-canvas text-text-muted"
                  )}
                >
                  {counts[p]}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      <ul className="mt-6 space-y-3">
        <AnimatePresence initial={false}>
          {visible.map((b, i) => {
            const s = PRIORITY_STYLE[b.priority];
            return (
              <motion.li
                layout
                key={b.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ delay: i * 0.04, duration: 0.35 }}
                className="group rounded-2xl border border-border-subtle bg-white/70 p-6 transition-all hover:border-emerald-200 hover:shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider",
                      s.bg,
                      s.fg
                    )}
                  >
                    {s.label}
                  </span>
                  <span className="rounded-full bg-canvas px-2.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-text-muted">
                    {b.category}
                  </span>
                  <span className="ml-auto font-mono text-[10.5px] text-text-muted">
                    {fmtDate(b.generatedAt)}
                  </span>
                </div>

                <h3 className="mt-3 text-[15px] font-bold leading-tight tracking-tight text-text-primary">
                  {b.title}
                </h3>

                <p className="mt-2 text-[12.5px] leading-relaxed text-text-secondary">
                  {b.summary}
                </p>

                {/* Recommendation callout */}
                <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-emerald-200/60 bg-emerald-50/50 p-3.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
                    <Sparkles className="h-3 w-3 text-emerald-700" />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                      Recommendation
                    </p>
                    <p className="mt-0.5 text-[12.5px] leading-snug text-emerald-950">
                      {b.recommendation}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle/60 pt-4">
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="font-semibold text-text-primary">
                      {b.affectedHEIs} HEIs
                    </span>
                    <span className="text-border-strong">·</span>
                    {b.affectedStates.slice(0, 3).map((st) => (
                      <span
                        key={st}
                        className="rounded-full bg-canvas px-2 py-0.5 font-medium text-text-secondary"
                      >
                        {st}
                      </span>
                    ))}
                    {b.affectedStates.length > 3 && (
                      <span className="text-text-muted">
                        +{b.affectedStates.length - 3} more
                      </span>
                    )}
                  </div>

                  <button className="flex items-center gap-1.5 rounded-full border border-border-subtle bg-white px-3.5 py-1.5 text-[11.5px] font-semibold text-text-secondary transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800">
                    <Download className="h-3 w-3" />
                    Export PDF
                  </button>
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>

      {visible.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
          <FileText className="h-6 w-6 text-text-muted" />
          <p className="text-[13px] font-semibold text-text-primary">
            No briefs match this filter
          </p>
          <button
            onClick={() => setFilter("ALL")}
            className="text-[12px] font-semibold text-emerald-700 hover:underline"
          >
            Reset filter
          </button>
        </div>
      )}
    </motion.section>
  );
}

/* ───── 4. GROWTH CARD ───── */

function GrowthCard() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="card-warm rounded-3xl p-7"
    >
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
          Year-over-Year
        </p>
        <h2 className="mt-1.5 font-display text-[20px] font-bold tracking-tight text-text-primary">
          Adoption growth
        </h2>
      </header>

      <div className="mt-6 flex items-baseline gap-2">
        <span className="font-display text-[48px] font-bold leading-none tracking-tighter text-emerald-600 tabular-nums">
          +{pct(DEMO_POLICY_STATS.yearOverYearGrowth)}
        </span>
        <span className="text-[13px] font-semibold text-text-secondary">
          since Sep 2025
        </span>
      </div>

      <dl className="mt-6 space-y-3">
        <div className="flex items-center justify-between border-b border-border-subtle/50 pb-3">
          <dt className="text-[12.5px] font-medium text-text-secondary">
            Decision volume
          </dt>
          <dd className="font-mono text-[13px] font-bold tabular-nums text-text-primary">
            24,800 / mo
          </dd>
        </div>
        <div className="flex items-center justify-between border-b border-border-subtle/50 pb-3">
          <dt className="text-[12.5px] font-medium text-text-secondary">
            Recognition rate
          </dt>
          <dd className="font-mono text-[13px] font-bold tabular-nums text-emerald-700">
            72% → 78%
          </dd>
        </div>
        <div className="flex items-center justify-between border-b border-border-subtle/50 pb-3">
          <dt className="text-[12.5px] font-medium text-text-secondary">
            Avg review time
          </dt>
          <dd className="font-mono text-[13px] font-bold tabular-nums text-emerald-700">
            32 min → 14 min
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-[12.5px] font-medium text-text-secondary">
            LLM cost / decision
          </dt>
          <dd className="font-mono text-[13px] font-bold tabular-nums text-emerald-700">
            -62%
          </dd>
        </div>
      </dl>

      <div className="mt-6 flex items-center gap-2 rounded-2xl bg-emerald-50/60 p-4">
        <TrendingUp className="h-4 w-4 text-emerald-700" />
        <p className="text-[12px] font-medium text-emerald-900">
          Adoption accelerating across Tier-2 and Tier-3 HEIs
        </p>
      </div>
    </motion.section>
  );
}

/* ───── PAGE ───── */

export default function GovPolicyPage() {
  const topBarRight = (
    <>
      <span className="pill hidden lg:inline-flex">
        <span className="font-semibold text-text-primary">
          Ministry / Nodal Officer
        </span>
        <span className="text-text-muted">·</span>
        <span>Policy Briefs</span>
      </span>
      <span className="pill hidden md:inline-flex">
        Chain ID: {DEMO_CHAIN.id}
      </span>
      <span className="relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-50 to-emerald-100 px-3.5 py-2 text-[11px] font-semibold text-emerald-800 shadow-sm">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <ShieldCheck className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Chain Integrity:</span>
        <span>{DEMO_CHAIN.integrity}</span>
      </span>
    </>
  );

  return (
    <AppShell
      title="Policy & Compliance"
      subtitle="NEP 2020 alignment and auto-generated policy signals"
      topBarRight={topBarRight}
      nav={GOV_NAV}
      reserveBottom
    >
      <section className="mx-auto max-w-[1500px] px-4 pb-4 pt-4 md:px-6">
        <motion.header
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 max-w-3xl"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgb(26_42_82)] text-white">
              <ScrollText className="h-5 w-5" />
            </span>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-700">
              Ministry Access · Read-only · Policy View
            </p>
          </div>
          <h1 className="mt-4 font-display text-[32px] font-bold leading-tight tracking-tighter text-[rgb(26_42_82)] md:text-[38px]">
            Policy &amp; compliance
          </h1>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-text-secondary">
            Live NEP 2020 compliance scoring and auto-generated policy briefs
            derived from aggregate recognition patterns. Every brief is
            privacy-preserving, anonymized, and ready for circulation.
          </p>
        </motion.header>

        <div className="space-y-5">
          <HeroStats />
          <CompliancePillars />
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
            <PolicyBriefs />
            <GrowthCard />
          </div>
        </div>
      </section>

      <BottomStrip
        label={"Compliance\nIndex"}
        statusTitle={`Overall ${pct(DEMO_POLICY_STATS.overallCompliance)} · target ${pct(DEMO_POLICY_STATS.complianceTarget)} · 5 active briefs`}
        statusIcon={<CheckCircle2 className="h-4 w-4" />}
        ctaLabel="Export policy bundle"
      />
    </AppShell>
  );
}