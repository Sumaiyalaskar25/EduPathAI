"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Search,
  Users,
  TrendingUp,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  PauseCircle,
  GraduationCap,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { BottomStrip } from "@/components/layout/BottomStrip";
import { TableSkeleton } from "@/components/feedback/Skeleton";
import { HEI_NAV } from "@/components/layout/Sidebar";
import { useRequireRole } from "@/lib/hooks/useRequireRole";
import { useHeiInstitutions } from "@/lib/api/hooks";
import type { HeiInstitution } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";

/* ───── helpers ───── */

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

function formatNum(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

/* ───── 1. STATS ───── */

function StatsBar({ stats }: { stats: { total: number; active: number; pending: number; totalDecisionsThisMonth: number } }) {
  const items = [
    { label: "Total institutions", value: stats.total, tone: "navy" },
    { label: "Active partner HEIs", value: stats.active, tone: "emerald" },
    { label: "Pending review", value: stats.pending, tone: "amber" },
    { label: "Decisions this month", value: stats.totalDecisionsThisMonth, tone: "emerald" },
  ] as const;

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
          <p className="text-[10.5px] font-bold uppercase tracking-wider text-text-muted">
            {s.label}
          </p>
          <p className={cn("mt-3 font-display text-[30px] font-bold leading-none tracking-tight tabular-nums", toneMap[s.tone])}>
            {s.value.toLocaleString("en-IN")}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

/* ───── 2. STATUS CHIP ───── */

const STATUS_MAP: Record<
  HeiInstitution["status"],
  { bg: string; fg: string; Icon: typeof CheckCircle2; label: string }
> = {
  active: { bg: "bg-emerald-100", fg: "text-emerald-800", Icon: CheckCircle2, label: "Active" },
  pending: { bg: "bg-amber-100", fg: "text-amber-900", Icon: AlertCircle, label: "Pending" },
  paused: { bg: "bg-slate-100", fg: "text-slate-700", Icon: PauseCircle, label: "Paused" },
};

const TYPE_COLORS: Record<string, string> = {
  IIT: "bg-[rgb(26_42_82)] text-white",
  NIT: "bg-[rgb(26_42_82)]/90 text-white",
  Central: "bg-[rgb(26_42_82)]/80 text-white",
  State: "bg-emerald-100 text-emerald-800",
  Private: "bg-amber-100 text-amber-900",
  Deemed: "bg-sky-100 text-sky-800",
};
const DEFAULT_TYPE_COLOR = "bg-slate-100 text-slate-700";

/* ───── 3. CARD ───── */

function InstitutionCard({ inst, index }: { inst: HeiInstitution; index: number }) {
  const s = STATUS_MAP[inst.status];
  const StatusIcon = s.Icon;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ delay: index * 0.03, duration: 0.35 }}
      className="group relative overflow-hidden rounded-3xl border border-border-subtle bg-white/70 p-6 transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-white hover:shadow-md"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[rgb(26_42_82)] to-[rgb(14_22_48)] text-white shadow-sm">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-[15px] font-bold leading-tight tracking-tight text-text-primary">
              {inst.shortName}
            </h3>
            <p className="mt-0.5 truncate text-[11.5px] text-text-secondary">
              {inst.name}
            </p>
          </div>
        </div>

        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
            s.bg,
            s.fg
          )}
        >
          <StatusIcon className="h-3 w-3" />
          {s.label}
        </span>
      </div>

      {/* Meta row */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-medium text-text-muted">
        <span className={cn("rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider", TYPE_COLORS[inst.type] ?? DEFAULT_TYPE_COLOR)}>
          {inst.type}
        </span>
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {inst.city}, {inst.state}
        </span>
        <span className="text-border-strong">·</span>
        <span className="inline-flex items-center gap-1">
          <GraduationCap className="h-3 w-3" />
          NAAC {inst.naac}
        </span>
      </div>

      {/* Metrics grid */}
      <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-border-subtle/60 pt-4">
        <div>
          <dt className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">
            <Users className="h-3 w-3" />
            Active
          </dt>
          <dd className="mt-1 font-mono text-[15px] font-bold tabular-nums text-text-primary">
            {formatNum(inst.studentsActive)}
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">
            <TrendingUp className="h-3 w-3" />
            Rate
          </dt>
          <dd
            className={cn(
              "mt-1 font-mono text-[15px] font-bold tabular-nums",
              inst.recognitionRate >= 0.8 ? "text-emerald-700" : inst.recognitionRate >= 0.7 ? "text-amber-700" : "text-rose-700"
            )}
          >
            {pct(inst.recognitionRate)}
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">
            <Clock className="h-3 w-3" />
            Review
          </dt>
          <dd className="mt-1 font-mono text-[15px] font-bold tabular-nums text-text-primary">
            {inst.avgReviewTime}
          </dd>
        </div>
      </dl>

      {/* Recognition bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-[10px] font-medium">
          <span className="text-text-muted">Recognition rate</span>
          <span className="font-mono tabular-nums text-text-secondary">
            {inst.decisionsThisMonth.toLocaleString("en-IN")} decisions this month
          </span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${inst.recognitionRate * 100}%` }}
            transition={{ delay: 0.2 + index * 0.03, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "h-full rounded-full",
              inst.recognitionRate >= 0.8 ? "bg-emerald-500" : inst.recognitionRate >= 0.7 ? "bg-amber-500" : "bg-rose-500"
            )}
          />
        </div>
      </div>

      {/* Footer link */}
      <button className="mt-4 flex w-full items-center justify-between rounded-2xl border border-border-subtle bg-canvas/60 px-4 py-2.5 text-[12px] font-semibold text-text-secondary transition-colors hover:bg-white hover:text-text-primary">
        <span>View full profile</span>
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </motion.li>
  );
}

/* ───── 4. FILTERS ───── */

function FilterTabs({
  active,
  onChange,
  types,
  counts,
}: {
  active: string;
  onChange: (k: string) => void;
  types: string[];
  counts: Record<string, number>;
}) {
  const filters = [{ key: "ALL", label: "All" }, ...types.map((t) => ({ key: t, label: t })), { key: "Pending", label: "Pending" }];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((f) => {
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
            <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums", isActive ? "bg-white/20 text-white" : "bg-canvas text-text-muted")}>
              {counts[f.key] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ───── MAIN ───── */

export default function HEIInstitutionsPage() {
  const session = useRequireRole("bos");
  const institutions = useHeiInstitutions();
  const [filter, setFilter] = useState<string>("ALL");
  const [query, setQuery] = useState("");

  const items = institutions.data?.items ?? [];
  const types = useMemo(() => Array.from(new Set(items.map((i) => i.type))).sort(), [items]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: items.length, Pending: items.filter((i) => i.status === "pending").length };
    for (const t of types) c[t] = items.filter((i) => i.type === t).length;
    return c;
  }, [items, types]);

  const visible = useMemo(() => {
    let list = items;
    if (filter === "Pending") list = list.filter((i) => i.status === "pending");
    else if (filter !== "ALL") list = list.filter((i) => i.type === filter);

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (i) => i.name.toLowerCase().includes(q) || i.shortName.toLowerCase().includes(q) || i.state.toLowerCase().includes(q) || i.city.toLowerCase().includes(q)
      );
    }
    return list;
  }, [items, filter, query]);

  if (!session) return null;

  const topBarRight = (
    <>
      <span className="pill hidden lg:inline-flex">
        <span className="font-semibold text-text-primary">BoS Reviewer · {session.institution}</span>
        <span className="text-text-muted">·</span>
        <span>{session.displayName}</span>
      </span>
      <span className="relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-50 to-emerald-100 px-3.5 py-2 text-[11px] font-semibold text-emerald-800 shadow-sm">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <ShieldCheck className="h-3.5 w-3.5" />
        <span>{institutions.data?.stats.active ?? 0} active partners</span>
      </span>
    </>
  );

  return (
    <AppShell title="Partner Institutions" subtitle="Directory of HEIs integrated with EduPathAI" topBarRight={topBarRight} nav={HEI_NAV} reserveBottom>
      <section className="mx-auto max-w-[1400px] px-4 pb-4 pt-4 md:px-6">
        <motion.header
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 max-w-3xl"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgb(26_42_82)] text-white">
              <Building2 className="h-5 w-5" />
            </span>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-700">
              Institutional Network
            </p>
          </div>
          <h1 className="mt-4 font-display text-[32px] font-bold leading-tight tracking-tighter text-[rgb(26_42_82)] md:text-[38px]">
            Partner institutions
          </h1>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-text-secondary">
            Every HEI currently integrated with the EduPathAI recognition
            network — with live recognition quality, review throughput, and
            accreditation.
          </p>
        </motion.header>

        {institutions.isLoading ? (
          <div className="space-y-5">
            <TableSkeleton rows={3} />
          </div>
        ) : institutions.isError ? (
          <div className="card-warm rounded-3xl p-8 text-center">
            <p className="text-[14px] font-semibold text-text-primary">We couldn't load the institution directory.</p>
            <p className="mt-2 text-[12.5px] text-text-secondary">
              {institutions.error instanceof Error ? institutions.error.message : "Try refreshing the page."}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {institutions.data && <StatsBar stats={institutions.data.stats} />}

            {/* Search + filters */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <FilterTabs active={filter} onChange={setFilter} types={types} counts={counts} />

              <div className="relative w-full lg:w-72">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search by name, city, or state…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full rounded-full border border-border-subtle bg-white/70 py-2.5 pl-9 pr-4 text-[13px] font-medium text-text-primary outline-none transition-colors placeholder:text-text-muted/70 focus:border-[rgb(26_42_82)]/40 focus:bg-white"
                />
              </div>
            </div>

            {/* Results */}
            {visible.length === 0 ? (
              <div className="card-warm flex flex-col items-center justify-center gap-2 py-16 text-center">
                <Search className="h-6 w-6 text-text-muted" />
                <p className="text-[14px] font-semibold text-text-primary">
                  {items.length === 0 ? "No institutions in the network yet" : "No institutions match this filter"}
                </p>
                <p className="text-[12px] text-text-secondary">
                  {items.length === 0 ? "Institutions appear here once onboarded." : "Try a different category or clear the search."}
                </p>
                {items.length > 0 && (
                  <button
                    onClick={() => {
                      setFilter("ALL");
                      setQuery("");
                    }}
                    className="mt-2 text-[12px] font-semibold text-emerald-700 hover:underline"
                  >
                    Reset filters
                  </button>
                )}
              </div>
            ) : (
              <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence initial={false}>
                  {visible.map((inst, i) => (
                    <InstitutionCard key={inst.id} inst={inst} index={i} />
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </div>
        )}
      </section>

      <BottomStrip
        label={"Network\nHealth"}
        statusTitle={
          institutions.data
            ? `${institutions.data.stats.active} active · ${institutions.data.stats.pending} pending · ${institutions.data.stats.totalStudents.toLocaleString("en-IN")} students`
            : "Loading network status…"
        }
        statusIcon={<CheckCircle2 className="h-4 w-4" />}
        ctaLabel="Invite new institution"
      />
    </AppShell>
  );
}
