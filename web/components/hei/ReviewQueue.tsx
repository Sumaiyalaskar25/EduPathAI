"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  X,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import {
  DEMO_HEI_QUEUE,
  DEMO_HEI_STATS,
  type HeiReviewItem,
  type HeiDecisionStatus,
} from "@/lib/constants/demo-hei";
import { cn } from "@/lib/utils/cn";

type FilterKey = "ALL" | "PENDING" | "HIGH";

/* ───── 1. STATS HEADER ───── */
function StatsBar() {
  const items: {
    label: string;
    value: number | string;
    tone: "amber" | "emerald" | "rose" | "navy";
    isText?: boolean;
  }[] = [
    { label: "Pending review", value: DEMO_HEI_STATS.pending, tone: "amber" },
    { label: "Approved today", value: DEMO_HEI_STATS.approvedToday, tone: "emerald" },
    { label: "Rejected today", value: DEMO_HEI_STATS.rejectedToday, tone: "rose" },
    { label: "Avg review time", value: DEMO_HEI_STATS.avgReviewTime, tone: "navy", isText: true },
  ];

  const toneMap = {
    amber: "text-amber-600",
    emerald: "text-emerald-600",
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
          <p className="text-[10.5px] font-bold uppercase tracking-wider text-text-muted">
            {s.label}
          </p>
          <p
            className={cn(
              "mt-2 font-display font-bold leading-none tracking-tight tabular-nums",
              s.isText ? "text-[22px]" : "text-[34px]",
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

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "HIGH", label: "High priority" },
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

const STATUS_CHIP: Record<HeiDecisionStatus, string> = {
  PENDING: "bg-amber-100 text-amber-900",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-rose-100 text-rose-800",
  ESCALATED: "bg-sky-100 text-sky-800",
};

const PRIORITY_DOT: Record<HeiReviewItem["priority"], string> = {
  high: "bg-rose-500",
  normal: "bg-amber-500",
  low: "bg-slate-300",
};

function RecommendationChip({
  rec,
}: {
  rec: HeiReviewItem["aiRecommendation"];
}) {
  const map = {
    DIRECT: "bg-emerald-100 text-emerald-800",
    BRIDGE: "bg-amber-100 text-amber-900",
    MISSING: "bg-rose-100 text-rose-800",
  };
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        map[rec]
      )}
    >
      {rec}
    </span>
  );
}

function ReviewRow({
  item,
  index,
  onAction,
}: {
  item: HeiReviewItem;
  index: number;
  onAction: (id: string, action: "approve" | "reject") => void;
}) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      className="group rounded-2xl border border-border-subtle bg-white/70 p-5 transition-all hover:border-emerald-200 hover:bg-white hover:shadow-md"
    >
      <div className="grid gap-5 md:grid-cols-[1fr_auto]">
        {/* Left: content */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "h-2 w-2 shrink-0 rounded-full",
                PRIORITY_DOT[item.priority]
              )}
              aria-label={`${item.priority} priority`}
            />
            <p className="text-[15px] font-semibold tracking-tight text-text-primary">
              {item.courses}
            </p>
            <RecommendationChip rec={item.aiRecommendation} />
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider",
                STATUS_CHIP[item.status]
              )}
            >
              {item.status}
            </span>
          </div>

          <p className="mt-1.5 text-[12.5px] text-text-secondary">
            <span className="font-semibold text-text-primary">
              {item.studentName}
            </span>{" "}
            · {item.studentProgramme}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11.5px] font-medium text-text-muted">
            <span>{item.sourceInstitution}</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-text-secondary">{item.targetInstitution}</span>
            <span className="text-border-strong">·</span>
            <Clock className="h-3 w-3" />
            <span>{item.age}</span>
          </div>

          <p className="mt-2 font-mono text-[10.5px] text-text-muted">
            {item.decisionId}
          </p>
        </div>

        {/* Right: confidence + actions */}
        <div className="flex flex-col items-start gap-3 md:min-w-[180px] md:items-end">
          <div className="w-full md:w-auto">
            <div className="flex items-center justify-between gap-3 text-[11px] font-medium">
              <span className="text-text-muted">AI confidence</span>
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
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 md:w-[140px]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.confidence * 100}%` }}
                transition={{ delay: 0.2 + index * 0.04, duration: 0.7 }}
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
            <div className="flex gap-2">
              <button
                onClick={() => onAction(item.id, "reject")}
                className="flex items-center gap-1.5 rounded-full border border-border-subtle bg-white px-3.5 py-2 text-[12px] font-semibold text-text-secondary transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
              >
                <X className="h-3.5 w-3.5" />
                Reject
              </button>
              <button
                onClick={() => onAction(item.id, "approve")}
                className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 py-2 text-[12px] font-semibold text-white shadow-[0_8px_20px_-8px_rgb(16_185_129_/_0.6)] transition-all hover:-translate-y-0.5 hover:bg-emerald-700"
              >
                <Check className="h-3.5 w-3.5" />
                Approve
              </button>
            </div>
          ) : (
            <button className="flex items-center gap-1.5 text-[12px] font-semibold text-emerald-700 hover:underline">
              View details
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </motion.li>
  );
}

/* ───── MAIN ───── */

export function ReviewQueue() {
  const [filter, setFilter] = useState<FilterKey>("ALL");
  const [items, setItems] = useState<HeiReviewItem[]>(DEMO_HEI_QUEUE);

  const counts = useMemo(
    () => ({
      ALL: items.length,
      PENDING: items.filter((i) => i.status === "PENDING").length,
      HIGH: items.filter((i) => i.priority === "high").length,
    }),
    [items]
  );

  const visible = useMemo(() => {
    if (filter === "PENDING") return items.filter((i) => i.status === "PENDING");
    if (filter === "HIGH") return items.filter((i) => i.priority === "high");
    return items;
  }, [items, filter]);

  const onAction = (id: string, action: "approve" | "reject") => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, status: action === "approve" ? "APPROVED" : "REJECTED" }
          : i
      )
    );
  };

  return (
    <div className="space-y-5">
      <StatsBar />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <FilterTabs active={filter} onChange={setFilter} counts={counts} />
        <p className="text-[12px] font-medium text-text-muted">
          <Sparkles className="mr-1 inline h-3 w-3" />
          AI proposes · you decide. Every action is logged on the audit ledger.
        </p>
      </div>

      {visible.length === 0 ? (
        <div className="card-warm flex flex-col items-center justify-center gap-2 py-16 text-center">
          <AlertTriangle className="h-6 w-6 text-text-muted" />
          <p className="text-[14px] font-semibold text-text-primary">
            Nothing to review here
          </p>
          <p className="text-[12px] text-text-secondary">
            Try a different filter or come back later.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {visible.map((item, i) => (
              <ReviewRow
                key={item.id}
                item={item}
                index={i}
                onAction={onAction}
              />
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}