"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Clock,
  ChevronRight,
  ClipboardCheck,
  TrendingUp,
  ShieldCheck,
  Filter,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { BottomStrip } from "@/components/layout/BottomStrip";
import { HEI_NAV } from "@/components/layout/Sidebar";
import {
  DEMO_HEI_APPROVED,
  DEMO_HEI_APPROVED_STATS,
  type HeiApprovedRecord,
  type HeiApprovedStatus,
} from "@/lib/constants/demo-hei-approved";
import { DEMO_CHAIN } from "@/lib/constants/demo";
import { cn } from "@/lib/utils/cn";

/* ───── helpers ───── */

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  } catch {
    return iso;
  }
}

function fmtTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

/* ───── 1. STATS BAR ───── */

function StatsBar() {
  const items = [
    { label: "Approved this week", value: DEMO_HEI_APPROVED_STATS.approvedThisWeek, tone: "emerald", Icon: CheckCircle2 },
    { label: "Rejected this week", value: DEMO_HEI_APPROVED_STATS.rejectedThisWeek, tone: "rose", Icon: XCircle },
    { label: "Escalated", value: DEMO_HEI_APPROVED_STATS.escalatedThisWeek, tone: "amber", Icon: ArrowUpRight },
    { label: "Avg review duration", value: DEMO_HEI_APPROVED_STATS.avgReviewDuration, tone: "navy", Icon: Clock, isText: true },
  ] as const;

  const toneMap = {
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    rose: "text-rose-600",
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
              "mt-3 font-display font-bold leading-none tracking-tight tabular-nums",
              "isText" in s && s.isText ? "text-[22px]" : "text-[34px]",
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

/* ───── 2. FILTER TABS ───── */

type FilterKey = "ALL" | "APPROVED" | "REJECTED" | "ESCALATED";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "APPROVED", label: "Approved" },
  { key: "REJECTED", label: "Rejected" },
  { key: "ESCALATED", label: "Escalated" },
];

function FilterTabs({
  active,
  onChange,
  counts,
}: {
  active: FilterKey;
  onChange: (k: FilterKey) => void;
  counts: Record<FilterKey, number>;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-canvas">
        <Filter className="h-3.5 w-3.5 text-text-muted" />
      </span>
      {FILTERS.map((f) => {
        const isActive = active === f.key;
        return (
          <button
            key={f.key}
            onClick={() => onChange(f.key)}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-[12.5px] font-semibold transition-all",
              isActive
                ? "bg-[rgb(26_42_82)] text-white shadow-[0_8px_20px_-8px_rgb(26_42_82_/_0.5)]"
                : "border border-border-subtle bg-white/70 text-text-secondary hover:bg-white hover:text-text-primary"
            )}
          >
            <span>{f.label}</span>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                isActive ? "bg-white/20 text-white" : "bg-canvas text-text-muted"
              )}
            >
              {counts[f.key]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ───── 3. ROW ───── */

const OUTCOME_STYLE: Record<
  HeiApprovedStatus,
  { bg: string; fg: string; Icon: typeof CheckCircle2 }
> = {
  APPROVED: { bg: "bg-emerald-100", fg: "text-emerald-800", Icon: CheckCircle2 },
  REJECTED: { bg: "bg-rose-100", fg: "text-rose-800", Icon: XCircle },
  ESCALATED: { bg: "bg-amber-100", fg: "text-amber-900", Icon: ArrowUpRight },
};

function ApprovedRow({
  record,
  index,
}: {
  record: HeiApprovedRecord;
  index: number;
}) {
  const o = OUTCOME_STYLE[record.outcome];
  const Icon = o.Icon;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ delay: index * 0.03, duration: 0.35 }}
      className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl border border-border-subtle bg-white/70 p-5 transition-all hover:border-emerald-200 hover:bg-white hover:shadow-md"
    >
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          o.bg
        )}
      >
        <Icon className={cn("h-4 w-4", o.fg)} />
      </span>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[14px] font-semibold tracking-tight text-text-primary">
            {record.courses}
          </p>
          {record.bridgeRequired && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-amber-900">
              Bridge approved
            </span>
          )}
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider",
              o.bg,
              o.fg
            )}
          >
            {record.outcome}
          </span>
        </div>

        <p className="mt-1.5 text-[12px] text-text-secondary">
          <span className="font-semibold text-text-primary">
            {record.studentName}
          </span>{" "}
          · {record.studentProgramme}
        </p>

        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] font-medium text-text-muted">
          <span>{record.sourceInstitution}</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-text-secondary">{record.targetInstitution}</span>
          <span className="text-border-strong">·</span>
          <span>{record.reviewer}</span>
          <span className="text-border-strong">·</span>
          <Clock className="h-3 w-3" />
          <span>{record.reviewDuration}</span>
        </div>

        <p className="mt-1.5 font-mono text-[10.5px] text-text-muted">
          {record.decisionId}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="text-[13px] font-semibold tabular-nums text-text-primary">
          {fmtDate(record.decidedAt)}
        </span>
        <span className="font-mono text-[11px] tabular-nums text-text-muted">
          {fmtTime(record.decidedAt)}
        </span>
      </div>
    </motion.li>
  );
}

/* ───── MAIN ───── */

export default function HEIApprovedPage() {
  const [filter, setFilter] = useState<FilterKey>("ALL");

  const counts = useMemo(
    () => ({
      ALL: DEMO_HEI_APPROVED.length,
      APPROVED: DEMO_HEI_APPROVED.filter((r) => r.outcome === "APPROVED").length,
      REJECTED: DEMO_HEI_APPROVED.filter((r) => r.outcome === "REJECTED").length,
      ESCALATED: DEMO_HEI_APPROVED.filter((r) => r.outcome === "ESCALATED").length,
    }),
    []
  );

  const visible = useMemo(() => {
    if (filter === "ALL") return DEMO_HEI_APPROVED;
    return DEMO_HEI_APPROVED.filter((r) => r.outcome === filter);
  }, [filter]);

  const topBarRight = (
    <>
      <span className="pill hidden lg:inline-flex">
        <span className="font-semibold text-text-primary">
          BoS Reviewer · IIT Bombay
        </span>
        <span className="text-text-muted">·</span>
        <span>Prof. S. Sen</span>
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
      title="Approved Decisions"
      subtitle="Complete audit trail of reviewer actions"
      topBarRight={topBarRight}
      nav={HEI_NAV}
      reserveBottom
    >
      <section className="mx-auto max-w-[1400px] px-4 pb-4 pt-4 md:px-6">
        {/* Page header */}
        <motion.header
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 max-w-3xl"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgb(26_42_82)] text-white">
              <ClipboardCheck className="h-5 w-5" />
            </span>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-700">
              Decision History
            </p>
          </div>
          <h1 className="mt-4 font-display text-[32px] font-bold leading-tight tracking-tighter text-[rgb(26_42_82)] md:text-[38px]">
            Approved decisions
          </h1>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-text-secondary">
            Every approval, rejection, and escalation — hash-chained and
            replayable. Filter by outcome to audit your review patterns.
          </p>

          {/* Approval rate chip */}
          <div className="mt-5 inline-flex items-center gap-2.5 rounded-full border border-emerald-200 bg-emerald-50/70 px-4 py-2">
            <TrendingUp className="h-4 w-4 text-emerald-700" />
            <span className="text-[12.5px] font-semibold text-emerald-900">
              {Math.round(DEMO_HEI_APPROVED_STATS.approvalRate * 100)}% approval rate
            </span>
            <span className="text-[11.5px] text-emerald-800/70">
              · {DEMO_HEI_APPROVED_STATS.avgReviewDuration} avg
            </span>
          </div>
        </motion.header>

        <div className="space-y-5">
          <StatsBar />

          <FilterTabs active={filter} onChange={setFilter} counts={counts} />

          {visible.length === 0 ? (
            <div className="card-warm flex flex-col items-center justify-center gap-2 py-16 text-center">
              <ClipboardCheck className="h-6 w-6 text-text-muted" />
              <p className="text-[14px] font-semibold text-text-primary">
                No {filter.toLowerCase()} decisions yet
              </p>
              <p className="text-[12px] text-text-secondary">
                Try a different filter.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              <AnimatePresence initial={false}>
                {visible.map((record, i) => (
                  <ApprovedRow key={record.id} record={record} index={i} />
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </section>

      <BottomStrip
        label={"Review\nQuality"}
        statusTitle={`${DEMO_HEI_APPROVED_STATS.approvedThisWeek} approvals this week · ${Math.round(DEMO_HEI_APPROVED_STATS.approvalRate * 100)}% acceptance`}
        statusIcon={<ShieldCheck className="h-4 w-4" />}
        ctaLabel="Export decision log"
      />
    </AppShell>
  );
}