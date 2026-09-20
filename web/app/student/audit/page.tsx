"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { BottomStrip } from "@/components/layout/BottomStrip";
import { ShieldCheck, ArrowRight, Loader2, Cpu, User } from "lucide-react";
import { useRequireRole } from "@/lib/hooks/useRequireRole";
import { useAuditList } from "@/lib/api/hooks";
import { parseAiRecommendation } from "@/lib/transforms/audit";
import type { AuditRecord } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";

function fmtDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

export default function LedgerPage() {
  const session = useRequireRole("learner");
  const audit = useAuditList(session?.externalRef);

  if (!session) return null;

  // Dedupe by decision_id, keeping the latest event per decision — the
  // ledger is append-only, so a reviewed decision has both its original
  // AI entry and a human-review entry.
  const byDecision = new Map<string, AuditRecord>();
  (audit.data ?? []).forEach((rec) => {
    const existing = byDecision.get(rec.decision_id);
    if (!existing || rec.timestamp > existing.timestamp) byDecision.set(rec.decision_id, rec);
  });
  const decisions = Array.from(byDecision.values()).sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));

  const topBarRight = (
    <>
      <span className="pill hidden lg:inline-flex">
        <span className="font-semibold text-text-primary">{session.externalRef}</span>
        <span className="text-text-muted">·</span>
        <span>{session.programme}</span>
      </span>
      <span className="relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-50 to-emerald-100 px-3.5 py-2 text-[11px] font-semibold text-emerald-800 shadow-sm">
        <ShieldCheck className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Chain Integrity:</span>
        <span>{decisions.length} record{decisions.length === 1 ? "" : "s"}</span>
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
      <section className="mx-auto max-w-[1400px] px-4 pb-4 pt-6 md:px-6">
        <header className="mb-8 max-w-3xl">
          <h1 className="font-sans text-[30px] font-bold leading-tight tracking-tight text-text-primary">
            Cryptographic Decision Bundle Explorer
            <span className="mx-2 text-text-muted">•</span>
            <span className="text-gradient-navy">Tamper-Evident Ledger</span>
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed text-text-secondary">
            The sovereign audit trace ensures{" "}
            <span className="font-semibold text-text-primary">immutable, tamper-evident verification</span>{" "}
            of AI and human academic decisions.
          </p>
        </header>

        {audit.isLoading ? (
          <div className="flex items-center justify-center gap-2 py-24 text-[13px] text-text-secondary">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading your decision history…
          </div>
        ) : decisions.length === 0 ? (
          <div className="card-warm py-16 text-center text-[13px] text-text-secondary">
            No decisions recorded yet — run a pathway analysis to generate your first ledger entry.
          </div>
        ) : (
          <div className="space-y-3">
            {decisions.map((rec, i) => {
              const parsed = parseAiRecommendation(rec.ai_recommendation);
              const reviewed = !!rec.human_decision;
              return (
                <motion.div key={rec.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.35 }}>
                  <Link
                    href={`/student/audit/${rec.decision_id}`}
                    className="group flex items-center gap-4 rounded-2xl border border-border-subtle bg-white/70 p-5 transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
                  >
                    <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", reviewed ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                      {reviewed ? <User className="h-4 w-4" /> : <Cpu className="h-4 w-4" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-semibold leading-snug text-text-primary">{parsed.summary}</p>
                      <p className="mt-1 font-mono text-[10.5px] text-text-muted">
                        {rec.decision_id.slice(0, 14)}… · {fmtDateTime(rec.timestamp)}
                        {rec.human_decision ? ` · ${rec.human_decision} by ${rec.auditor_name ?? "reviewer"}` : " · Awaiting review"}
                      </p>
                    </div>
                    <span className="hidden shrink-0 rounded-full bg-canvas px-2.5 py-1 font-mono text-[11px] text-text-secondary sm:inline-block">
                      {Math.round(rec.confidence * 100)}%
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5" />
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
