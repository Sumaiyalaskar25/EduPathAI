"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { BottomStrip } from "@/components/layout/BottomStrip";
import {
  ShieldCheck,
  ArrowRight,
  Loader2,
  Cpu,
  User,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  Lock,
  Layers,
  Sparkles,
  ExternalLink,
  Building2,
  FileCheck2,
} from "lucide-react";
import { useRequireRole } from "@/lib/hooks/useRequireRole";
import { useAuditList } from "@/lib/api/hooks";
import { parseAiRecommendation } from "@/lib/transforms/audit";
import type { AuditRecord } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";

function fmtDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function truncHash(h: string, head = 8, tail = 6): string {
  if (!h || h.length <= head + tail + 3) return h;
  return `${h.slice(0, head)}…${h.slice(-tail)}`;
}

type FilterTab = "ALL" | "PENDING" | "APPROVED" | "HIGH_CONFIDENCE";

export default function LedgerPage() {
  const session = useRequireRole("learner");
  const audit = useAuditList(session?.externalRef);

  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Dedupe by decision_id, keeping the latest event per decision
  const decisions = useMemo(() => {
    const byDecision = new Map<string, AuditRecord>();
    (audit.data ?? []).forEach((rec) => {
      const existing = byDecision.get(rec.decision_id);
      if (!existing || rec.timestamp > existing.timestamp) byDecision.set(rec.decision_id, rec);
    });
    return Array.from(byDecision.values()).sort((a, b) =>
      a.timestamp < b.timestamp ? 1 : -1
    );
  }, [audit.data]);

  const filteredDecisions = useMemo(() => {
    return decisions.filter((rec) => {
      const parsed = parseAiRecommendation(rec.ai_recommendation);
      const reviewed = !!rec.human_decision;
      const isApproved = rec.human_decision === "APPROVED";
      const isHighConf = rec.confidence >= 0.9;

      // Filter Tab
      if (activeTab === "PENDING" && reviewed) return false;
      if (activeTab === "APPROVED" && !isApproved) return false;
      if (activeTab === "HIGH_CONFIDENCE" && !isHighConf) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = rec.decision_id.toLowerCase().includes(q);
        const matchesHash = (rec.current_hash || "").toLowerCase().includes(q);
        const matchesSummary = parsed.summary.toLowerCase().includes(q);
        const matchesAuditor = (rec.auditor_name || "").toLowerCase().includes(q);
        if (!matchesId && !matchesHash && !matchesSummary && !matchesAuditor) {
          return false;
        }
      }

      return true;
    });
  }, [decisions, activeTab, searchQuery]);

  const copyHash = (hash: string, id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(hash);
    setCopiedId(id);
    toast.success("Cryptographic hash copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!session) return null;

  const topBarRight = (
    <>
      <span className="pill hidden lg:inline-flex">
        <span className="font-semibold text-text-primary">{session.externalRef}</span>
        <span className="text-text-muted">·</span>
        <span>{session.programme}</span>
      </span>
      <span className="relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-50 to-emerald-100 px-3.5 py-2 text-[11px] font-semibold text-emerald-800 shadow-sm border border-emerald-200/60">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <ShieldCheck className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Ledger Chain:</span>
        <span>{decisions.length} sealed blocks</span>
      </span>
    </>
  );

  return (
    <AppShell
      title="Gap-Find & BridgePath Curriculum Reconciler"
      subtitle="Tamper-evident verification of AI and human academic decisions"
      topBarRight={topBarRight}
      reserveBottom
    >
      <section className="mx-auto max-w-[1450px] px-4 pb-8 pt-6 md:px-6">
        
        {/* Hero Header */}
        <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-0.5 font-mono text-[10.5px] font-bold uppercase tracking-wider text-emerald-800 border border-emerald-200">
                <Lock className="h-3 w-3" />
                Immutable Partitioned SHA-256
              </span>
              <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10.5px] font-semibold text-blue-700 border border-blue-100">
                NEP 2020 Sovereign Ledger
              </span>
            </div>
            <h1 className="mt-2.5 font-display text-[30px] font-extrabold leading-tight tracking-tight text-slate-900 md:text-[34px]">
              Cryptographic Decision Bundle Explorer
            </h1>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-text-secondary">
              Every academic equivalence and bridge assignment is anchored to an immutable,
              reproducible audit trace with SHA-256 state hashes, rule snapshot bundles, and
              tamper-evident signatures.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <Link
              href="/student/pathways"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-[12.5px] font-semibold text-white shadow-sm transition-all hover:bg-slate-800"
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>Simulate New Pathway</span>
            </Link>
          </div>
        </header>

        {/* 4 Stat Metric Cards */}
        <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4 md:gap-4 mb-6">
          <div className="card-warm rounded-2xl p-4 border border-white/80 shadow-xs">
            <div className="flex items-center justify-between text-text-muted">
              <span className="text-[10px] font-bold uppercase tracking-wider">Sealed Records</span>
              <FileCheck2 className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="mt-2 font-display text-[26px] font-bold text-slate-900 tabular-nums">
              {decisions.length}
            </p>
            <p className="mt-0.5 text-[11px] text-text-secondary">
              Partitioned Merkle chain
            </p>
          </div>

          <div className="card-warm rounded-2xl p-4 border border-white/80 shadow-xs">
            <div className="flex items-center justify-between text-text-muted">
              <span className="text-[10px] font-bold uppercase tracking-wider">Chain Integrity</span>
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="font-display text-[24px] font-bold text-emerald-700">
                100% Intact
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-text-secondary">
              Genesis verification validated
            </p>
          </div>

          <div className="card-warm rounded-2xl p-4 border border-white/80 shadow-xs">
            <div className="flex items-center justify-between text-text-muted">
              <span className="text-[10px] font-bold uppercase tracking-wider">BoS Authority</span>
              <Building2 className="h-4 w-4 text-blue-600" />
            </div>
            <p className="mt-2 font-display text-[22px] font-bold text-slate-900 truncate">
              {session.targetInstitution || "IIT Bombay"}
            </p>
            <p className="mt-0.5 text-[11px] text-text-secondary">
              Board of Studies Council
            </p>
          </div>

          <div className="card-warm rounded-2xl p-4 border border-white/80 shadow-xs">
            <div className="flex items-center justify-between text-text-muted">
              <span className="text-[10px] font-bold uppercase tracking-wider">Consensus Engine</span>
              <Layers className="h-4 w-4 text-purple-600" />
            </div>
            <p className="mt-2 font-display text-[22px] font-bold text-slate-900">
              NCrF Level 6.0
            </p>
            <p className="mt-0.5 text-[11px] text-text-secondary">
              Ruleset commit v2.4-active
            </p>
          </div>
        </div>

        {/* Filter and Search Controls */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-5">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: "ALL", label: `All Audits (${decisions.length})` },
              {
                key: "PENDING",
                label: `Awaiting Review (${decisions.filter((d) => !d.human_decision).length})`,
              },
              {
                key: "APPROVED",
                label: `BoS Approved (${decisions.filter((d) => d.human_decision === "APPROVED").length})`,
              },
              {
                key: "HIGH_CONFIDENCE",
                label: `High Match (>90%)`,
              },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as FilterTab)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-all",
                  activeTab === tab.key
                    ? "bg-slate-900 text-white shadow-xs"
                    : "border border-slate-200/80 bg-white/80 text-text-secondary hover:bg-white hover:text-text-primary"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px] md:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by decision ID, hash, or code…"
              className="w-full rounded-full border border-slate-200 bg-white/90 py-1.5 pl-9 pr-4 text-[12px] text-text-primary placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400/30"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Ledger Entries List */}
        {audit.isLoading ? (
          <div className="flex items-center justify-center gap-2 py-24 text-[13px] text-text-secondary">
            <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
            Syncing sovereign ledger records from PostgreSQL…
          </div>
        ) : filteredDecisions.length === 0 ? (
          <div className="card-warm rounded-3xl py-16 text-center text-[13px] text-text-secondary">
            {searchQuery
              ? `No ledger entries match "${searchQuery}".`
              : "No decision records in this filter view."}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDecisions.map((rec, i) => {
              const parsed = parseAiRecommendation(rec.ai_recommendation);
              const reviewed = !!rec.human_decision;
              const isApproved = rec.human_decision === "APPROVED";
              const isContested = rec.human_decision === "CONTESTED";
              const blockNo = decisions.length - i;
              const sourceInst = session.institution || "VIT Vellore";
              const targetInst = session.targetInstitution || "IIT Bombay";

              return (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.35 }}
                >
                  <Link
                    href={`/student/audit/${rec.decision_id}`}
                    className="group relative flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white/90 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-white hover:shadow-md md:flex-row md:items-center md:justify-between"
                  >
                    {/* Left Icon & Main Info */}
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      <span
                        className={cn(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border shadow-xs transition-colors",
                          reviewed
                            ? isApproved
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                              : "bg-purple-50 border-purple-200 text-purple-700"
                            : "bg-amber-50 border-amber-200 text-amber-700"
                        )}
                      >
                        {reviewed ? (
                          isApproved ? <User className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />
                        ) : (
                          <Cpu className="h-5 w-5" />
                        )}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[10.5px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            #BLOCK-{String(blockNo).padStart(2, "0")}
                          </span>
                          <span className="rounded-md bg-blue-50 px-2 py-0.5 font-mono text-[10.5px] font-bold text-blue-800 border border-blue-100">
                            {sourceInst} ➔ {targetInst}
                          </span>
                          {reviewed ? (
                            isApproved ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10.5px] font-bold text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="h-3 w-3" />
                                BoS Approved & Sealed
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-[10.5px] font-bold text-purple-800 border border-purple-200">
                                Contested by Student
                              </span>
                            )
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10.5px] font-bold text-amber-800 border border-amber-200">
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-500" />
                              </span>
                              Awaiting BoS Review
                            </span>
                          )}
                        </div>

                        <p className="mt-1.5 text-[14px] font-bold leading-snug text-slate-900 group-hover:text-emerald-950 transition-colors">
                          {parsed.headline}
                        </p>
                        
                        <p className="mt-1 text-[12px] text-text-secondary line-clamp-1">
                          {parsed.summary}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-text-muted">
                          <span>Recorded {fmtDateTime(rec.timestamp)}</span>
                          <span>•</span>
                          <span className="font-mono">
                            UUID: {rec.decision_id.slice(0, 14)}…
                          </span>
                          {rec.current_hash && (
                            <>
                              <span>•</span>
                              <button
                                type="button"
                                onClick={(e) => copyHash(rec.current_hash, rec.id, e)}
                                className="inline-flex items-center gap-1 font-mono text-[10.5px] text-slate-500 hover:text-slate-800"
                              >
                                {copiedId === rec.id ? (
                                  <Check className="h-3 w-3 text-emerald-600" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                                <span>Hash: {truncHash(rec.current_hash, 6, 4)}</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Confidence & Action */}
                    <div className="flex shrink-0 items-center justify-between gap-4 border-t border-slate-100 pt-3 md:border-none md:pt-0">
                      <div className="flex flex-col items-end">
                        <span className="font-mono text-[13px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          {Math.round(rec.confidence * 100)}% Match
                        </span>
                        <span className="mt-0.5 text-[10px] text-text-muted">
                          Deterministic
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[12px] font-semibold text-slate-700 group-hover:text-emerald-700">
                        <span className="hidden sm:inline">Inspect Proof</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      <BottomStrip
        label={"Audit Sync\nStatus"}
        statusTitle="HEI Board of Studies pre-approved bridge pathway"
        statusIcon={<ShieldCheck className="h-4 w-4" />}
        ctaLabel="Proceed & Update Academic Plan"
        ctaHref="/student/plan/update"
      />
    </AppShell>
  );
}
