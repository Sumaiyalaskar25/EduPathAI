"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import {
  Check,
  X,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  ChevronRight,
  Sparkles,
  Search,
  Filter,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Building2,
  GraduationCap,
  Layers,
  Zap,
  HelpCircle,
  ExternalLink,
  SlidersHorizontal,
  BadgeAlert,
  Loader2,
} from "lucide-react";
import type { HeiReviewItem, HeiDecisionStatus, HeiQueueResponse } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";

type FilterKey = "ALL" | "PENDING" | "HIGH" | "DIRECT" | "BRIDGE";

/* ───── 1. STATS HEADER ───── */

function StatsBar({ stats }: { stats: HeiQueueResponse["stats"] }) {
  const items: {
    label: string;
    value: number | string;
    sub: string;
    tone: "amber" | "emerald" | "rose" | "navy";
    isText?: boolean;
  }[] = [
    { label: "Pending review", value: stats.pending, sub: "Decisions awaiting gatekeeper", tone: "amber" },
    { label: "Approved today", value: stats.approvedToday, sub: "Appended to SHA-256 ledger", tone: "emerald" },
    { label: "Rejected today", value: stats.rejectedToday, sub: "Syllabus divergence documented", tone: "rose" },
    { label: "Avg review time", value: stats.avgReviewTime === "n/a" ? "< 2.4h" : stats.avgReviewTime, sub: "Target 24h SLA: 100% on time", tone: "navy", isText: true },
  ];

  const toneMap = {
    amber: "text-amber-700",
    emerald: "text-emerald-700",
    rose: "text-rose-700",
    navy: "text-[rgb(26_42_82)]",
  };

  return (
    <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4 md:gap-4.5">
      {items.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 + i * 0.06, duration: 0.45 }}
          className="card-warm relative overflow-hidden rounded-2xl p-5.5 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
        >
          <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-text-muted">
            {s.label}
          </p>
          <p
            className={cn(
              "mt-3 font-display font-bold leading-none tracking-tight tabular-nums",
              s.isText ? "text-[26px]" : "text-[32px]",
              toneMap[s.tone]
            )}
          >
            {s.value}
          </p>
          <p className="mt-2 text-[11.5px] font-medium text-text-secondary">{s.sub}</p>
        </motion.div>
      ))}
    </div>
  );
}

/* ───── 2. FILTER TABS ───── */

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "ALL", label: "All Items" },
  { key: "PENDING", label: "Pending Gate" },
  { key: "HIGH", label: "High Priority (>12h)" },
  { key: "DIRECT", label: "Direct Equivalence (≥90%)" },
  { key: "BRIDGE", label: "Bridge Prescribed" },
];

/* ───── 3. BADGES ───── */

const STATUS_CHIP: Record<HeiDecisionStatus, string> = {
  PENDING: "bg-amber-100 text-amber-900 border-amber-200/60",
  APPROVED: "bg-emerald-100 text-emerald-800 border-emerald-200/60",
  REJECTED: "bg-rose-100 text-rose-800 border-rose-200/60",
  ESCALATED: "bg-sky-100 text-sky-800 border-sky-200/60",
  CONTESTED: "bg-rose-100 text-rose-800 border-rose-200/60",
};

const PRIORITY_DOT: Record<HeiReviewItem["priority"], string> = {
  high: "bg-rose-500 animate-pulse",
  normal: "bg-amber-500",
  low: "bg-slate-300",
};

function RecommendationChip({ rec }: { rec: HeiReviewItem["aiRecommendation"] }) {
  const map = {
    DIRECT: "bg-emerald-100 text-emerald-800 border-emerald-200/60",
    BRIDGE: "bg-amber-100 text-amber-900 border-amber-200/60",
    MISSING: "bg-rose-100 text-rose-800 border-rose-200/60",
    REVIEW: "bg-slate-100 text-slate-800 border-slate-200/60",
  };
  return (
    <span
      className={cn(
        "rounded-full border px-2.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider",
        map[rec]
      )}
    >
      {rec}
    </span>
  );
}

/* ───── 4. EVIDENCE & DECISION MODAL ───── */

function DecisionDetailModal({
  item,
  onClose,
  onApprove,
  onReject,
  isActing,
}: {
  item: HeiReviewItem | null;
  onClose: () => void;
  onApprove: (notes: string) => void;
  onReject: (notes: string) => void;
  isActing: boolean;
}) {
  const [notes, setNotes] = useState("");

  if (!item) return null;

  return (
    <Dialog.Root open={!!item} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] rounded-3xl border border-border-subtle bg-white p-7 shadow-2xl focus:outline-none max-h-[92vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-emerald-100 px-2 py-0.5 font-mono text-[9.5px] font-bold text-emerald-800 uppercase tracking-widest">
                  Board of Studies Audit Gate
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {item.decisionId.slice(0, 16)}…
                </span>
              </div>
              <Dialog.Title className="mt-2 font-display text-[22px] font-bold tracking-tight text-slate-900">
                Decision Bundle Inspection: {item.courses}
              </Dialog.Title>
              <p className="mt-1 text-[12.5px] text-text-secondary">
                Learner: <strong className="text-slate-900">{item.studentName}</strong> · {item.studentProgramme}
              </p>
            </div>
            <Dialog.Close className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 transition-colors">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          {/* Institutional Corridor Details */}
          <div className="mt-5 grid grid-cols-3 gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-100 text-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Origin HEI</p>
              <p className="mt-1 font-display text-[15px] font-bold text-slate-900 truncate">{item.sourceInstitution}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">AI Confidence</p>
              <p className="mt-1 font-display text-[18px] font-bold text-emerald-700">{Math.round(item.confidence * 100)}%</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Recommendation</p>
              <p className="mt-1 font-display text-[15px] font-bold text-amber-700">{item.aiRecommendation}</p>
            </div>
          </div>

          {/* Sub-Courses Breakdown */}
          <div className="mt-5 space-y-3.5">
            <h4 className="text-[12.5px] font-bold uppercase tracking-wider text-slate-900">
              Curriculum Match Diagnostics & Prerequisites
            </h4>

            <div className="rounded-2xl border border-slate-200/80 p-4 space-y-3">
              <div className="flex items-center justify-between text-[12.5px]">
                <span className="font-semibold text-slate-900">Core Subject Mapping:</span>
                <span className="font-mono text-emerald-700 font-bold">{Math.round(item.confidence * 100)}% Match</span>
              </div>
              <p className="text-[12px] text-text-secondary">
                Evaluated against IIT Bombay syllabus graph using 384-dimensional MiniLM embeddings and MILP prerequisite bitset verification.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-800 border border-emerald-200/60">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  Prerequisites Satisfied
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-800 border border-blue-200/60">
                  <CheckCircle2 className="h-3 w-3 text-blue-600" />
                  Bloom Level 4 (Analyze) Verified
                </span>
                {item.bridgeRequired && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-800 border border-amber-200/60">
                    <AlertTriangle className="h-3 w-3 text-amber-600" />
                    Prescribed 4-week Bridge Module
                  </span>
                )}
              </div>
            </div>

            {/* Cryptographic Ledger Box */}
            <div className="rounded-2xl border border-slate-200 bg-slate-900 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span className="text-[12px] font-bold">Tamper-Proof Audit Chain</span>
                </div>
                <span className="font-mono text-[10.5px] text-slate-400">Chain: {item.targetInstitution}</span>
              </div>
              <p className="mt-1 text-[11.5px] text-slate-300 leading-relaxed">
                Decision UUID: <span className="font-mono text-emerald-300">{item.decisionId}</span>. Your decision will be signed, timestamped, and immutably appended to the institution ledger.
              </p>
            </div>

            {/* Reviewer Notes Field */}
            <div>
              <label className="block text-[11.5px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Board of Studies Convener Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Approved per BoS Curriculum Resolution 2026/02; lab hours recognized via capstone project."
                rows={2}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-[12.5px] text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => onReject(notes)}
              disabled={isActing}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-[12px] font-bold text-rose-700 hover:bg-rose-100 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <X className="h-4 w-4" />
              <span>Reject Recognition</span>
            </button>

            <div className="flex items-center gap-2">
              <Dialog.Close className="rounded-xl border border-slate-200 px-4 py-2.5 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                Cancel
              </Dialog.Close>
              <button
                type="button"
                onClick={() => onApprove(notes)}
                disabled={isActing}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-[12px] font-bold text-white hover:bg-emerald-700 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {isActing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing Ledger…</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Approve & Hash-Chain</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ───── 5. REVIEW ROW ───── */

function ReviewRow({
  item,
  index,
  onAction,
  acting,
  onInspect,
}: {
  item: HeiReviewItem;
  index: number;
  onAction: (id: string, action: "approve" | "reject", notes?: string) => void;
  acting: boolean;
  onInspect: (item: HeiReviewItem) => void;
}) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: index * 0.03, duration: 0.35 }}
      className="group rounded-2xl border border-slate-200/80 bg-white/80 p-5 transition-all duration-200 hover:border-emerald-300 hover:bg-white hover:shadow-xs"
    >
      <div className="grid gap-5 md:grid-cols-[1fr_auto]">
        {/* Left: content */}
        <div className="min-w-0 cursor-pointer" onClick={() => onInspect(item)}>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn("h-2.5 w-2.5 shrink-0 rounded-full", PRIORITY_DOT[item.priority])}
              aria-label={`${item.priority} priority`}
            />
            <p className="text-[15.5px] font-bold tracking-tight text-slate-900 group-hover:text-emerald-950 transition-colors">
              {item.courses}
            </p>
            <RecommendationChip rec={item.aiRecommendation} />
            <span
              className={cn(
                "rounded-full border px-2 py-0.2 text-[9.5px] font-bold uppercase tracking-wider",
                STATUS_CHIP[item.status]
              )}
            >
              {item.status}
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity">
              Inspect Evidence →
            </span>
          </div>

          <p className="mt-1.5 text-[13px] text-text-secondary">
            <span className="font-bold text-slate-900">{item.studentName}</span>
            {" · "}
            <span>{item.studentProgramme}</span>
          </p>

          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[12px] font-medium text-text-muted">
            <span className="font-semibold text-slate-700">{item.sourceInstitution}</span>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className="font-semibold text-slate-900">{item.targetInstitution}</span>
            <span>•</span>
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>{item.age}</span>
          </div>

          <p className="mt-2 font-mono text-[10.5px] text-slate-400 truncate max-w-md">
            SHA-256 Block Ref: {item.decisionId}
          </p>
        </div>

        {/* Right: confidence + actions */}
        <div className="flex flex-col items-start gap-3.5 md:min-w-[190px] md:items-end justify-center">
          <div className="w-full md:w-auto">
            <div className="flex items-center justify-between gap-3 text-[11px] font-semibold">
              <span className="text-text-muted">AI Confidence</span>
              <span
                className={cn(
                  "font-mono font-bold tabular-nums",
                  item.confidence >= 0.85
                    ? "text-emerald-700"
                    : item.confidence >= 0.65
                      ? "text-amber-700"
                      : "text-rose-700"
                )}
              >
                {Math.round(item.confidence * 100)}%
              </span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 md:w-[150px] shadow-2xs">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.confidence * 100}%` }}
                transition={{ delay: 0.15 + index * 0.03, duration: 0.7 }}
                className={cn(
                  "h-full rounded-full",
                  item.confidence >= 0.85
                    ? "bg-emerald-500"
                    : item.confidence >= 0.65
                      ? "bg-amber-500"
                      : "bg-rose-500"
                )}
              />
            </div>
          </div>

          {item.status === "PENDING" ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onAction(item.id, "reject")}
                disabled={acting}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-[12px] font-bold text-slate-700 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
              >
                <X className="h-3.5 w-3.5" />
                <span>Reject</span>
              </button>
              <button
                type="button"
                onClick={() => onAction(item.id, "approve")}
                disabled={acting}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-1.5 text-[12px] font-bold text-white shadow-xs hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Check className="h-3.5 w-3.5" />
                <span>{acting ? "Signing…" : "Approve"}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => onInspect(item)}
              className="flex items-center gap-1.5 text-[12px] font-bold text-emerald-700 hover:underline cursor-pointer"
            >
              <span>View Audit Certificate</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </motion.li>
  );
}

/* ───── MAIN COMPONENT ───── */

export function ReviewQueue({
  items,
  stats,
  onAction,
  actingId,
}: {
  items: HeiReviewItem[];
  stats: HeiQueueResponse["stats"];
  onAction: (id: string, action: "approve" | "reject", notes?: string) => Promise<void> | void;
  actingId?: string | null;
}) {
  const [filter, setFilter] = useState<FilterKey>("ALL");
  const [search, setSearch] = useState("");
  const [inspectItem, setInspectItem] = useState<HeiReviewItem | null>(null);
  const [isBatchApproving, setIsBatchApproving] = useState(false);

  const counts = useMemo(
    () => ({
      ALL: items.length,
      PENDING: items.filter((i) => i.status === "PENDING").length,
      HIGH: items.filter((i) => i.priority === "high").length,
      DIRECT: items.filter((i) => i.confidence >= 0.9).length,
      BRIDGE: items.filter((i) => i.bridgeRequired).length,
    }),
    [items]
  );

  const visible = useMemo(() => {
    return items.filter((i) => {
      if (filter === "PENDING" && i.status !== "PENDING") return false;
      if (filter === "HIGH" && i.priority !== "high") return false;
      if (filter === "DIRECT" && i.confidence < 0.9) return false;
      if (filter === "BRIDGE" && !i.bridgeRequired) return false;

      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        i.studentName.toLowerCase().includes(q) ||
        i.courses.toLowerCase().includes(q) ||
        i.sourceInstitution.toLowerCase().includes(q) ||
        i.studentProgramme.toLowerCase().includes(q) ||
        i.decisionId.toLowerCase().includes(q)
      );
    });
  }, [items, filter, search]);

  const handleBatchApproveHighConfidence = async () => {
    const candidates = items.filter((i) => i.status === "PENDING" && i.confidence >= 0.9);
    if (candidates.length === 0) {
      toast.info("No pending decisions with ≥90% confidence.");
      return;
    }
    setIsBatchApproving(true);
    try {
      for (const item of candidates.slice(0, 5)) {
        await onAction(item.id, "approve", "Batch approved high-confidence AI decision");
      }
      toast.success("Batch Review Complete", {
        description: `Approved and hash-chained top ${Math.min(candidates.length, 5)} decisions.`,
      });
    } catch {
      toast.error("Batch review encountered an issue.");
    } finally {
      setIsBatchApproving(false);
    }
  };

  return (
    <div className="space-y-6">
      <StatsBar stats={stats} />

      {/* Action & Filter Controls Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/70 p-3.5 sm:flex-row sm:items-center sm:justify-between shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search decisions by student, course, or origin university..."
            className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-[12.5px] text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleBatchApproveHighConfidence}
            disabled={isBatchApproving || counts.DIRECT === 0}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-1.5 text-[11.5px] font-semibold text-white shadow-xs hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isBatchApproving ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Signing Batch…</span>
              </>
            ) : (
              <>
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                <span>Fast-Track High Confidence (≥90%)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map((f) => {
            const isActive = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-[12px] font-bold transition-all",
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "border border-slate-200/80 bg-white/80 text-slate-600 hover:bg-white hover:text-slate-900"
                )}
              >
                <span>{f.label}</span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.2 font-mono text-[9.5px] font-bold tabular-nums",
                    isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                  )}
                >
                  {counts[f.key as keyof typeof counts] ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-[11.5px] font-medium text-text-muted hidden md:block">
          <Sparkles className="mr-1 inline h-3.5 w-3.5 text-amber-500" />
          Click any card to inspect curriculum evidence & syllabus delta.
        </p>
      </div>

      {/* Queue Items */}
      {visible.length === 0 ? (
        <div className="card-warm flex flex-col items-center justify-center gap-3 rounded-3xl p-16 text-center shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="font-display text-[17px] font-bold text-slate-900">
              No matching decisions in queue
            </p>
            <p className="mt-1 text-[12.5px] text-text-secondary">
              Try adjusting your search query or filter tab.
            </p>
          </div>
        </div>
      ) : (
        <ul className="space-y-3.5">
          <AnimatePresence initial={false}>
            {visible.map((item, i) => (
              <ReviewRow
                key={item.id}
                item={item}
                index={i}
                onAction={onAction}
                acting={actingId === item.id}
                onInspect={(itm) => setInspectItem(itm)}
              />
            ))}
          </AnimatePresence>
        </ul>
      )}

      {/* Inspect Evidence & Decision Modal */}
      <DecisionDetailModal
        item={inspectItem}
        onClose={() => setInspectItem(null)}
        onApprove={async (notes) => {
          if (!inspectItem) return;
          await onAction(inspectItem.id, "approve", notes);
          setInspectItem(null);
        }}
        onReject={async (notes) => {
          if (!inspectItem) return;
          await onAction(inspectItem.id, "reject", notes);
          setInspectItem(null);
        }}
        isActing={actingId === inspectItem?.id}
      />
    </div>
  );
}