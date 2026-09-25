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
  Filter,
  X,
  RefreshCw,
  Plus,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { BottomStrip } from "@/components/layout/BottomStrip";
import { TableSkeleton } from "@/components/feedback/Skeleton";
import { HEI_NAV } from "@/components/layout/Sidebar";
import { useRequireRole } from "@/lib/hooks/useRequireRole";
import { useHeiInstitutions } from "@/lib/api/hooks";
import type { HeiInstitution } from "@/lib/api/types";
import { InstitutionProfileModal } from "@/components/hei/InstitutionProfileModal";
import { InviteInstitutionModal } from "@/components/hei/InviteInstitutionModal";
import { cn } from "@/lib/utils/cn";

/* ───── helpers ───── */

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

function formatNum(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

/* ───── 1. STATS (INTERACTIVE FILTER SHORTCUTS) ───── */

function StatsBar({
  stats,
  activeFilter,
  onSelectFilter,
}: {
  stats: { total: number; active: number; pending: number; totalDecisionsThisMonth: number };
  activeFilter: string;
  onSelectFilter: (k: string) => void;
}) {
  const items = [
    { key: "ALL", label: "Total institutions", value: stats.total, tone: "navy" },
    { key: "Active", label: "Active partner HEIs", value: stats.active, tone: "emerald" },
    { key: "Pending", label: "Pending review", value: stats.pending, tone: "amber" },
    { key: "Decisions", label: "Decisions this month", value: stats.totalDecisionsThisMonth, tone: "emerald" },
  ] as const;

  const toneMap = {
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    navy: "text-[rgb(26_42_82)]",
  };

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {items.map((s, i) => {
        const isSelected = activeFilter === s.key;
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
              <Building2 className={cn("h-4 w-4 transition-transform group-hover:scale-110", toneMap[s.tone])} />
            </div>
            <p className={cn("mt-3 font-display text-[30px] font-bold leading-none tracking-tight tabular-nums", toneMap[s.tone])}>
              {s.value.toLocaleString("en-IN")}
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

/* ───── 2. STATUS & TYPE CHIPS ───── */

const STATUS_MAP: Record<
  HeiInstitution["status"],
  { bg: string; fg: string; Icon: typeof CheckCircle2; label: string }
> = {
  active: { bg: "bg-emerald-100", fg: "text-emerald-800", Icon: CheckCircle2, label: "Active" },
  pending: { bg: "bg-amber-100", fg: "text-amber-900", Icon: AlertCircle, label: "Pending" },
  paused: { bg: "bg-slate-100", fg: "text-slate-700", Icon: PauseCircle, label: "Paused" },
};

const TYPE_COLORS: Record<string, string> = {
  "IIT / NIT / INI": "bg-indigo-100 text-indigo-900 border-indigo-200",
  "State & Central Universities": "bg-emerald-100 text-emerald-900 border-emerald-200",
  "Autonomous Engineering Colleges": "bg-sky-100 text-sky-900 border-sky-200",
  "Deemed & Private Universities": "bg-amber-100 text-amber-900 border-amber-200",
};
const DEFAULT_TYPE_COLOR = "bg-slate-100 text-slate-800 border-slate-200";

/* ───── 3. INSTITUTION CARD ───── */

function InstitutionCard({
  inst,
  index,
  onSelect,
}: {
  inst: HeiInstitution;
  index: number;
  onSelect: (inst: HeiInstitution) => void;
}) {
  const s = STATUS_MAP[inst.status] || STATUS_MAP.active;
  const StatusIcon = s.Icon;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ delay: index * 0.02, duration: 0.35 }}
      onClick={() => onSelect(inst)}
      className="group relative cursor-pointer overflow-hidden rounded-3xl border border-border-subtle bg-white/75 p-6 transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-white hover:shadow-lg hover:scale-[1.004]"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[rgb(26_42_82)] to-[rgb(14_22_48)] text-white shadow-sm shadow-navy-950/20 group-hover:scale-105 transition-transform">
            <Building2 className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h3 className="text-[15px] font-bold leading-tight tracking-tight text-text-primary group-hover:text-emerald-900 transition-colors">
              {inst.shortName}
            </h3>
            <p className="mt-1 line-clamp-1 text-[11.5px] text-text-secondary" title={inst.name}>
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
      <div className="mt-3.5 flex flex-wrap items-center gap-2 text-[11px] font-medium text-text-muted">
        <span className={cn("rounded-full px-2.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider border", TYPE_COLORS[inst.type] ?? DEFAULT_TYPE_COLOR)}>
          {inst.type}
        </span>
        <span className="inline-flex items-center gap-1 text-text-secondary">
          <MapPin className="h-3 w-3 text-text-muted" />
          {inst.city}, {inst.state}
        </span>
        <span className="text-border-strong">·</span>
        <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[10.5px] border border-emerald-200">
          <GraduationCap className="h-3 w-3" />
          NAAC {inst.naac || "A+"}
        </span>
      </div>

      {/* Metrics grid */}
      <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-border-subtle/70 pt-4">
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
          <dd className="mt-1 font-mono text-[14px] font-bold tabular-nums text-text-primary truncate">
            {inst.avgReviewTime}
          </dd>
        </div>
      </dl>

      {/* Recognition progress bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-[10px] font-medium">
          <span className="text-text-muted">Recognition index</span>
          <span className="font-mono tabular-nums text-text-secondary">
            {inst.decisionsThisMonth.toLocaleString("en-IN")} decisions logged
          </span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${inst.recognitionRate * 100}%` }}
            transition={{ delay: 0.15 + index * 0.02, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "h-full rounded-full",
              inst.recognitionRate >= 0.8 ? "bg-emerald-500" : inst.recognitionRate >= 0.7 ? "bg-amber-500" : "bg-rose-500"
            )}
          />
        </div>
      </div>

      {/* Footer link */}
      <div className="mt-4 flex w-full items-center justify-between rounded-2xl border border-border-subtle bg-canvas/60 px-4 py-2.5 text-[12px] font-semibold text-text-secondary transition-colors group-hover:bg-[rgb(26_42_82)] group-hover:text-white">
        <span>View full profile & telemetry</span>
        <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </div>
    </motion.li>
  );
}

/* ───── 4. FILTER TABS ───── */

function FilterTabs({
  active,
  onChange,
  counts,
}: {
  active: string;
  onChange: (k: string) => void;
  counts: Record<string, number>;
}) {
  const categories = [
    { key: "ALL", label: "All" },
    { key: "IIT / NIT / INI", label: "IIT / NIT / INI" },
    { key: "State & Central Universities", label: "State & Central" },
    { key: "Autonomous Engineering Colleges", label: "Autonomous Colleges" },
    { key: "Deemed & Private Universities", label: "Deemed & Private" },
    { key: "Pending", label: "Pending Review" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-text-muted">
        <Filter className="h-3.5 w-3.5" />
      </span>
      {categories.map((f) => {
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
              {counts[f.key] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ───── MAIN PAGE ───── */

export default function HEIInstitutionsPage() {
  const session = useRequireRole("bos");
  const institutions = useHeiInstitutions();

  const [filter, setFilter] = useState<string>("ALL");
  const [selectedState, setSelectedState] = useState<string>("ALL");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "rate" | "students" | "decisions">("name");
  const [selectedInstitution, setSelectedInstitution] = useState<HeiInstitution | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const items = institutions.data?.items ?? [];

  // Distinct Indian States list
  const states = useMemo(() => {
    return Array.from(new Set(items.map((i) => i.state).filter(Boolean))).sort();
  }, [items]);

  const counts = useMemo(() => {
    return {
      ALL: items.length,
      "IIT / NIT / INI": items.filter((i) => i.type === "IIT / NIT / INI").length,
      "State & Central Universities": items.filter((i) => i.type === "State & Central Universities").length,
      "Autonomous Engineering Colleges": items.filter((i) => i.type === "Autonomous Engineering Colleges").length,
      "Deemed & Private Universities": items.filter((i) => i.type === "Deemed & Private Universities").length,
      Pending: items.filter((i) => i.status === "pending").length,
      Active: items.filter((i) => i.status === "active").length,
      Decisions: items.filter((i) => i.decisionsThisMonth > 0).length,
    };
  }, [items]);

  const visible = useMemo(() => {
    let list = items;

    // Filter by Category or Status shortcut
    if (filter === "Pending") {
      list = list.filter((i) => i.status === "pending");
    } else if (filter === "Active") {
      list = list.filter((i) => i.status === "active");
    } else if (filter === "Decisions") {
      list = list.filter((i) => i.decisionsThisMonth > 0);
    } else if (filter !== "ALL") {
      list = list.filter((i) => i.type === filter);
    }

    // Filter by State
    if (selectedState !== "ALL") {
      list = list.filter((i) => i.state.toLowerCase() === selectedState.toLowerCase());
    }

    // Filter by Search Query
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.shortName.toLowerCase().includes(q) ||
          i.state.toLowerCase().includes(q) ||
          i.city.toLowerCase().includes(q) ||
          i.type.toLowerCase().includes(q)
      );
    }

    // Sort
    const sorted = [...list];
    if (sortBy === "name") {
      sorted.sort((a, b) => a.shortName.localeCompare(b.shortName));
    } else if (sortBy === "rate") {
      sorted.sort((a, b) => b.recognitionRate - a.recognitionRate);
    } else if (sortBy === "students") {
      sorted.sort((a, b) => b.studentsActive - a.studentsActive);
    } else if (sortBy === "decisions") {
      sorted.sort((a, b) => b.decisionsThisMonth - a.decisionsThisMonth);
    }

    return sorted;
  }, [items, filter, selectedState, query, sortBy]);

  if (!session) return null;

  const handleRefresh = async () => {
    await institutions.refetch();
    toast.success("Institutional directory re-synchronized with live nodes");
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
        disabled={institutions.isFetching}
        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/80 px-3 py-1.5 text-[11.5px] font-semibold text-text-primary hover:bg-white shadow-xs transition-all disabled:opacity-50"
        title="Synchronize directory with live database"
      >
        <RefreshCw className={cn("h-3.5 w-3.5 text-text-muted", institutions.isFetching && "animate-spin text-emerald-600")} />
        <span className="hidden sm:inline">Sync Directory</span>
      </button>

      <span className="relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-50 to-emerald-100 px-3.5 py-1.5 text-[11px] font-semibold text-emerald-800 shadow-xs border border-emerald-200">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
        <span>{institutions.data?.stats.active ?? 0} active partners</span>
      </span>
    </>
  );

  return (
    <AppShell title="Partner Institutions" subtitle="Directory of HEIs integrated with EduPathAI" topBarRight={topBarRight} nav={HEI_NAV} reserveBottom>
      <section className="mx-auto max-w-[1400px] px-4 pb-6 pt-4 md:px-6">
        {/* Page Header */}
        <motion.header
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 max-w-3xl"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgb(26_42_82)] text-white shadow-md shadow-navy-950/20">
              <Building2 className="h-5 w-5" />
            </span>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-700">
              National Institutional Network
            </p>
          </div>
          <h1 className="mt-4 font-display text-[32px] font-bold leading-tight tracking-tighter text-[rgb(26_42_82)] md:text-[38px]">
            Partner institutions
          </h1>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-text-secondary">
            Higher Education Institutions connected to the EduPathAI recognition network. Real-time telemetry on active candidate corridors, credit recognition throughput, and statutory Academic Bank of Credits accreditation.
          </p>
        </motion.header>

        {institutions.isLoading ? (
          <TableSkeleton rows={4} />
        ) : institutions.isError ? (
          <div className="card-warm rounded-3xl p-8 text-center">
            <p className="text-[14px] font-semibold text-text-primary">We couldn't load the institution directory.</p>
            <p className="mt-2 text-[12.5px] text-text-secondary">
              {institutions.error instanceof Error ? institutions.error.message : "Try refreshing the page."}
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
            {/* Interactive Stats Bar */}
            {institutions.data && (
              <StatsBar
                stats={institutions.data.stats}
                activeFilter={filter}
                onSelectFilter={(k) => setFilter(k)}
              />
            )}

            {/* Filter and Search Controls */}
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white/60 p-3 shadow-xs">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <FilterTabs active={filter} onChange={setFilter} counts={counts} />

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Search box */}
                  <div className="relative min-w-[200px] sm:min-w-[240px] flex-1 sm:flex-initial">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
                    <input
                      type="text"
                      placeholder="Search name, city, state…"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="w-full rounded-full border border-slate-200 bg-white pl-8 pr-8 py-1.5 text-[12px] text-text-primary placeholder:text-text-muted focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    {query && (
                      <button
                        type="button"
                        onClick={() => setQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* State selector */}
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    aria-label="Filter by Indian State"
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11.5px] font-semibold text-text-primary focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="ALL">All States ({states.length})</option>
                    {states.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>

                  {/* Sort selector */}
                  <div className="flex items-center gap-1.5 text-[12px] text-text-secondary">
                    <SlidersHorizontal className="h-3.5 w-3.5 text-text-muted" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      aria-label="Sort institutions"
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11.5px] font-semibold text-text-primary focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="name">Name (A-Z)</option>
                      <option value="rate">Highest recognition rate</option>
                      <option value="students">Most active students</option>
                      <option value="decisions">Most decisions</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Institutions Grid */}
            {visible.length === 0 ? (
              <div className="card-warm flex flex-col items-center justify-center gap-3 py-16 text-center">
                <Search className="h-8 w-8 text-text-muted" />
                <p className="text-[15px] font-semibold text-text-primary">
                  {items.length === 0
                    ? "No institutions in the network yet"
                    : query
                    ? `No partner institutions match "${query}"`
                    : "No institutions match current filters"}
                </p>
                <p className="text-[12.5px] text-text-secondary max-w-md">
                  {items.length === 0
                    ? "Institutions will appear here once onboarded into the EduPathAI recognition network."
                    : "Try resetting your search query or choosing 'All' categories to view the full directory."}
                </p>
                {(query || filter !== "ALL" || selectedState !== "ALL") && (
                  <button
                    type="button"
                    onClick={() => {
                      setFilter("ALL");
                      setSelectedState("ALL");
                      setQuery("");
                    }}
                    className="mt-2 rounded-xl bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 text-[12px] font-semibold text-text-primary transition-colors"
                  >
                    Reset all filters
                  </button>
                )}
              </div>
            ) : (
              <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence initial={false}>
                  {visible.map((inst, i) => (
                    <InstitutionCard
                      key={inst.id}
                      inst={inst}
                      index={i}
                      onSelect={(target) => setSelectedInstitution(target)}
                    />
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </div>
        )}
      </section>

      {/* Institution Governance & Accreditation Modal */}
      <InstitutionProfileModal
        open={!!selectedInstitution}
        onOpenChange={(isOpen) => !isOpen && setSelectedInstitution(null)}
        institution={selectedInstitution}
      />

      {/* Invite New Partner HEI Modal */}
      <InviteInstitutionModal
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
      />

      <BottomStrip
        label={"Network\nHealth"}
        statusTitle={
          institutions.data
            ? `${institutions.data.stats.active} active · ${institutions.data.stats.pending} pending · ${institutions.data.stats.totalStudents.toLocaleString("en-IN")} students`
            : "Loading network status…"
        }
        statusSubtitle="Directly federated with UGC Academic Bank of Credits"
        statusIcon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
        ctaLabel="Invite new institution"
        onCta={() => setInviteModalOpen(true)}
      />
    </AppShell>
  );
}
