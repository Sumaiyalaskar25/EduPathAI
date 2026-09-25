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
  Search,
  X,
  Copy,
  Check,
  RefreshCw,
  FileCheck2,
  Sparkles,
  Building2,
  GraduationCap,
  SlidersHorizontal,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { BottomStrip } from "@/components/layout/BottomStrip";
import { TableSkeleton } from "@/components/feedback/Skeleton";
import { HEI_NAV } from "@/components/layout/Sidebar";
import { useRequireRole } from "@/lib/hooks/useRequireRole";
import { useHeiApproved } from "@/lib/api/hooks";
import type { HeiApprovedRecord } from "@/lib/api/types";
import { ApprovedDecisionModal } from "@/components/hei/ApprovedDecisionModal";
import { DecisionExportModal } from "@/components/hei/DecisionExportModal";
import { cn } from "@/lib/utils/cn";

/* ───── helpers ───── */

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

function fmtTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

/* ───── 1. STATS BAR (INTERACTIVE FILTER SHORTCUTS) ───── */

function StatsBar({
  stats,
  activeFilter,
  onSelectFilter,
}: {
  stats: { approvedThisWeek: number; rejectedThisWeek: number; escalatedThisWeek: number; avgReviewDuration: string };
  activeFilter: FilterKey;
  onSelectFilter: (k: FilterKey) => void;
}) {
  const items = [
    { key: "APPROVED" as FilterKey, label: "Approved this week", value: stats.approvedThisWeek, tone: "emerald", Icon: CheckCircle2 },
    { key: "REJECTED" as FilterKey, label: "Rejected this week", value: stats.rejectedThisWeek, tone: "rose", Icon: XCircle },
    { key: "CONTESTED" as FilterKey, label: "Contested", value: stats.escalatedThisWeek, tone: "amber", Icon: ArrowUpRight },
    { key: "ALL" as FilterKey, label: "Avg review duration", value: stats.avgReviewDuration, tone: "navy", Icon: Clock, isText: true },
  ] as const;

  const toneMap = {
    emerald: "text-emerald-600 border-emerald-200/80 bg-emerald-50/30",
    amber: "text-amber-600 border-amber-200/80 bg-amber-50/30",
    rose: "text-rose-600 border-rose-200/80 bg-rose-50/30",
    navy: "text-[rgb(26_42_82)] border-slate-200/80 bg-white/70",
  };

  const textToneMap = {
    emerald: "text-emerald-700",
    amber: "text-amber-700",
    rose: "text-rose-700",
    navy: "text-[rgb(26_42_82)]",
  };

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {items.map((s, i) => {
        const isSelected = activeFilter === s.key && s.key !== "ALL";
        return (
          <motion.button
            type="button"
            key={s.label}
            onClick={() => onSelectFilter(s.key)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.06, duration: 0.45 }}
            className={cn(
              "group relative flex flex-col text-left card-warm p-5 transition-all cursor-pointer hover:shadow-md hover:scale-[1.01]",
              isSelected ? "ring-2 ring-[rgb(26_42_82)] shadow-md bg-white" : ""
            )}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-text-muted">{s.label}</span>
              <s.Icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", textToneMap[s.tone])} />
            </div>
            <p
              className={cn(
                "mt-3 font-display font-bold leading-none tracking-tight tabular-nums",
                "isText" in s && s.isText ? "text-[22px]" : "text-[34px]",
                textToneMap[s.tone]
              )}
            >
              {s.value}
            </p>
            <span className="mt-2 text-[10px] font-medium text-text-muted opacity-0 group-hover:opacity-100 transition-opacity">
              Click to filter
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

/* ───── 2. FILTER TABS & SEARCH ───── */

type FilterKey = "ALL" | "APPROVED" | "REJECTED" | "CONTESTED" | "BRIDGE";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "APPROVED", label: "Approved" },
  { key: "REJECTED", label: "Rejected" },
  { key: "CONTESTED", label: "Contested" },
  { key: "BRIDGE", label: "Bridge Prescribed" },
];

/* ───── 3. ROW COMPONENT ───── */

const OUTCOME_STYLE: Record<HeiApprovedRecord["outcome"], { bg: string; fg: string; border: string; Icon: typeof CheckCircle2 }> = {
  APPROVED: { bg: "bg-emerald-100", fg: "text-emerald-800", border: "border-emerald-200", Icon: CheckCircle2 },
  REJECTED: { bg: "bg-rose-100", fg: "text-rose-800", border: "border-rose-200", Icon: XCircle },
  CONTESTED: { bg: "bg-amber-100", fg: "text-amber-900", border: "border-amber-200", Icon: ArrowUpRight },
};

function ApprovedRow({
  record,
  index,
  onSelect,
}: {
  record: HeiApprovedRecord;
  index: number;
  onSelect: (r: HeiApprovedRecord) => void;
}) {
  const [copied, setCopied] = useState(false);
  const o = OUTCOME_STYLE[record.outcome] || OUTCOME_STYLE.APPROVED;
  const Icon = o.Icon;

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(record.decisionId);
    setCopied(true);
    toast.success("Decision hash copied");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ delay: index * 0.02, duration: 0.3 }}
      onClick={() => onSelect(record)}
      className="group relative cursor-pointer grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl border border-border-subtle bg-white/75 p-5 transition-all hover:border-emerald-300 hover:bg-white hover:shadow-lg hover:scale-[1.004]"
    >
      <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-xs", o.bg, o.border, "border")}>
        <Icon className={cn("h-5 w-5", o.fg)} />
      </span>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[14.5px] font-bold tracking-tight text-text-primary">{record.courses}</p>
          {record.bridgeRequired && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-amber-900 border border-amber-300/60">
              <Award className="h-3 w-3 text-amber-700" />
              Bridge Prescribed
            </span>
          )}
          <span className={cn("rounded-full px-2.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider border", o.bg, o.fg, o.border)}>
            {record.outcome}
          </span>
        </div>

        <p className="mt-1.5 text-[12.5px] text-text-secondary">
          <strong className="font-semibold text-text-primary">{record.studentName}</strong> · {record.studentProgramme || "B.Tech Computer Science & Engineering"}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-medium text-text-muted">
          <span className="inline-flex items-center gap-1 text-text-primary">
            <Building2 className="h-3 w-3 text-text-muted" />
            {record.sourceInstitution}
          </span>
          <ChevronRight className="h-3 w-3 text-text-muted" />
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-900">
            <Building2 className="h-3 w-3 text-emerald-700" />
            {record.targetInstitution}
          </span>
          <span className="text-border-strong">·</span>
          <span>Reviewer: <strong className="text-text-primary font-medium">{record.reviewer}</strong></span>
          <span className="text-border-strong">·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3 text-text-muted" />
            {record.reviewDuration}
          </span>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyId}
            className="group/hash inline-flex items-center gap-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 px-2 py-0.5 font-mono text-[10.5px] text-text-muted hover:text-text-primary transition-colors"
            title="Click to copy SHA-256 Decision ID"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3 text-text-muted" />}
            <span className="truncate max-w-[180px] sm:max-w-[280px]">{record.decisionId}</span>
          </button>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <div className="text-right">
          <span className="text-[13px] font-semibold tabular-nums text-text-primary block">{fmtDate(record.decidedAt)}</span>
          <span className="font-mono text-[11px] tabular-nums text-text-muted block">{fmtTime(record.decidedAt)}</span>
        </div>

        <span className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1 rounded-full bg-[rgb(26_42_82)] px-3 py-1 text-[11px] font-semibold text-white shadow-xs">
          <span>Certificate</span>
          <ChevronRight className="h-3 w-3" />
        </span>
      </div>
    </motion.li>
  );
}

/* ───── MAIN PAGE ───── */

export default function HEIApprovedPage() {
  const session = useRequireRole("bos");
  const approved = useHeiApproved(session?.institution);

  const [filter, setFilter] = useState<FilterKey>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");
  const [selectedRecord, setSelectedRecord] = useState<HeiApprovedRecord | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  const items = approved.data?.items ?? [];

  const counts = useMemo(
    () => ({
      ALL: items.length,
      APPROVED: items.filter((r) => r.outcome === "APPROVED").length,
      REJECTED: items.filter((r) => r.outcome === "REJECTED").length,
      CONTESTED: items.filter((r) => r.outcome === "CONTESTED").length,
      BRIDGE: items.filter((r) => r.bridgeRequired).length,
    }),
    [items]
  );

  const visible = useMemo(() => {
    let list = items;

    // Filter by outcome
    if (filter === "APPROVED") {
      list = list.filter((r) => r.outcome === "APPROVED");
    } else if (filter === "REJECTED") {
      list = list.filter((r) => r.outcome === "REJECTED");
    } else if (filter === "CONTESTED") {
      list = list.filter((r) => r.outcome === "CONTESTED");
    } else if (filter === "BRIDGE") {
      list = list.filter((r) => r.bridgeRequired);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.studentName.toLowerCase().includes(q) ||
          r.courses.toLowerCase().includes(q) ||
          r.sourceInstitution.toLowerCase().includes(q) ||
          r.targetInstitution.toLowerCase().includes(q) ||
          r.reviewer.toLowerCase().includes(q) ||
          r.decisionId.toLowerCase().includes(q) ||
          (r.studentProgramme && r.studentProgramme.toLowerCase().includes(q))
      );
    }

    // Sort
    const sorted = [...list];
    if (sortBy === "newest") {
      sorted.sort((a, b) => new Date(b.decidedAt).getTime() - new Date(a.decidedAt).getTime());
    } else if (sortBy === "oldest") {
      sorted.sort((a, b) => new Date(a.decidedAt).getTime() - new Date(b.decidedAt).getTime());
    } else if (sortBy === "name") {
      sorted.sort((a, b) => a.studentName.localeCompare(b.studentName));
    }

    return sorted;
  }, [items, filter, searchQuery, sortBy]);

  if (!session) return null;

  const handleRefresh = async () => {
    await approved.refetch();
    toast.success("Decision ledger refreshed from live PostgreSQL node");
  };

  const topBarRight = (
    <>
      <span className="pill hidden lg:inline-flex">
        <span className="font-semibold text-text-primary">BoS Reviewer · {session.institution}</span>
        <span className="text-text-muted">·</span>
        <span>{session.displayName}</span>
      </span>

      <button
        type="button"
        onClick={handleRefresh}
        disabled={approved.isFetching}
        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/80 px-3 py-1.5 text-[11.5px] font-semibold text-text-primary hover:bg-white shadow-xs transition-all disabled:opacity-50"
        title="Refresh decision ledger from live backend"
      >
        <RefreshCw className={cn("h-3.5 w-3.5 text-text-muted", approved.isFetching && "animate-spin text-emerald-600")} />
        <span className="hidden sm:inline">Sync Ledger</span>
      </button>

      {approved.data && (
        <span className="relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-50 to-emerald-100 px-3.5 py-1.5 text-[11px] font-semibold text-emerald-800 shadow-xs border border-emerald-200">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
          <span>{Math.round(approved.data.stats.approvalRate * 100)}% approval rate</span>
        </span>
      )}
    </>
  );

  return (
    <AppShell title="Approved Decisions" subtitle="Complete audit trail of reviewer actions" topBarRight={topBarRight} nav={HEI_NAV} reserveBottom>
      <section className="mx-auto max-w-[1400px] px-4 pb-6 pt-4 md:px-6">
        {/* Page header */}
        <motion.header initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="mb-6 max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgb(26_42_82)] text-white shadow-md shadow-navy-950/20">
              <ClipboardCheck className="h-5 w-5" />
            </span>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-700">Decision History & Audit Trail</p>
          </div>
          <h1 className="mt-4 font-display text-[32px] font-bold leading-tight tracking-tighter text-[rgb(26_42_82)] md:text-[38px]">
            Approved decisions
          </h1>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-text-secondary">
            Every recognition, rejection, and contest at {session.institution} is recorded into a SHA-256 hash-chained immutable audit ledger. Click any decision card to inspect the complete cryptographic proof and download the official recognition certificate.
          </p>

          {approved.data && (
            <div className="mt-5 inline-flex items-center gap-2.5 rounded-full border border-emerald-200 bg-emerald-50/70 px-4 py-2 shadow-xs">
              <TrendingUp className="h-4 w-4 text-emerald-700" />
              <span className="text-[12.5px] font-semibold text-emerald-900">{Math.round(approved.data.stats.approvalRate * 100)}% acceptance rate</span>
              <span className="text-[11.5px] text-emerald-800/70">· {approved.data.stats.avgReviewDuration} average turnaround</span>
            </div>
          )}
        </motion.header>

        {approved.isLoading ? (
          <TableSkeleton rows={4} />
        ) : approved.isError ? (
          <div className="card-warm rounded-3xl p-8 text-center">
            <p className="text-[14px] font-semibold text-text-primary">We couldn't load the decision history.</p>
            <p className="mt-2 text-[12.5px] text-text-secondary">
              {approved.error instanceof Error ? approved.error.message : "Try refreshing the page."}
            </p>
            <button
              type="button"
              onClick={handleRefresh}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[rgb(26_42_82)] px-4 py-2 text-[12.5px] font-semibold text-white"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retry</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            {approved.data && (
              <StatsBar
                stats={approved.data.stats}
                activeFilter={filter}
                onSelectFilter={(k) => setFilter(k)}
              />
            )}

            {/* Filter and Search Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white/60 p-3 shadow-xs">
              {/* Filter tabs */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-text-muted">
                  <Filter className="h-3.5 w-3.5" />
                </span>
                {FILTERS.map((f) => {
                  const isActive = filter === f.key;
                  return (
                    <button
                      key={f.key}
                      onClick={() => setFilter(f.key)}
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

              {/* Search & Sort */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative min-w-[220px] sm:min-w-[260px] flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search candidate, course, HEI, hash…"
                    className="w-full rounded-full border border-slate-200 bg-white pl-8 pr-8 py-1.5 text-[12px] text-text-primary placeholder:text-text-muted focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-[12px] text-text-secondary">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-text-muted" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    aria-label="Sort decisions"
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11.5px] font-semibold text-text-primary focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="name">Candidate (A-Z)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* List of decisions */}
            {visible.length === 0 ? (
              <div className="card-warm flex flex-col items-center justify-center gap-3 py-16 text-center">
                <ClipboardCheck className="h-8 w-8 text-text-muted" />
                <p className="text-[15px] font-semibold text-text-primary">
                  {items.length === 0
                    ? "No decisions recorded yet"
                    : searchQuery
                    ? `No decisions match "${searchQuery}"`
                    : `No ${filter.toLowerCase()} decisions recorded`}
                </p>
                <p className="text-[12.5px] text-text-secondary max-w-md">
                  {items.length === 0
                    ? "Decisions will appear here immediately once Board of Studies reviewers take action in the Review Queue."
                    : searchQuery
                    ? "Try clearing your search query or switching filters to see other ledger blocks."
                    : "Try selecting 'All' or another outcome filter above."}
                </p>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="mt-2 rounded-xl bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 text-[12px] font-semibold text-text-primary transition-colors"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              <ul className="space-y-3">
                <AnimatePresence initial={false}>
                  {visible.map((record, i) => (
                    <ApprovedRow
                      key={record.id}
                      record={record}
                      index={i}
                      onSelect={(r) => setSelectedRecord(r)}
                    />
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </div>
        )}
      </section>

      {/* Decision Detail & Cryptographic Certificate Modal */}
      <ApprovedDecisionModal
        open={!!selectedRecord}
        onOpenChange={(isOpen) => !isOpen && setSelectedRecord(null)}
        record={selectedRecord}
      />

      {/* Executive Decision Log Export Manifest Modal */}
      <DecisionExportModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        institution={session.institution ?? "IIT Bombay"}
        reviewerName={session.displayName ?? "BoS Reviewer"}
        data={approved.data}
      />

      <BottomStrip
        label={"Review\nQuality"}
        statusTitle={
          approved.data
            ? `${approved.data.stats.approvedThisWeek} approvals this week · ${Math.round(approved.data.stats.approvalRate * 100)}% acceptance`
            : "Loading review quality…"
        }
        statusSubtitle="Cryptographically chained to sovereign audit ledger"
        statusIcon={<ShieldCheck className="h-4 w-4 text-emerald-500" />}
        ctaLabel="Export decision log"
        onCta={() => setExportModalOpen(true)}
      />
    </AppShell>
  );
}
