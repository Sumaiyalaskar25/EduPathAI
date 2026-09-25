"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, ShieldCheck, Loader2, RefreshCw, FileText } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { BottomStrip } from "@/components/layout/BottomStrip";
import { MobilityIntelligence } from "@/components/gov/MobilityIntelligence";
import { GOV_NAV } from "@/components/layout/Sidebar";
import { useRequireRole } from "@/lib/hooks/useRequireRole";
import { useGovAggregate } from "@/lib/api/hooks";
import { toast } from "sonner";

export default function GovPage() {
  const session = useRequireRole("ministry");
  const agg = useGovAggregate();
  const [isBriefOpen, setIsBriefOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!session) return null;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await agg.refetch();
      toast.success("Mobility Signals Synchronized", {
        description: "Re-aggregated live decisions from SHA-256 tamper-proof ledger.",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const topBarRight = (
    <>
      <button
        type="button"
        onClick={handleRefresh}
        disabled={isRefreshing || agg.isFetching}
        className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/90 px-3 py-1.5 text-[11.5px] font-semibold text-slate-700 shadow-2xs hover:bg-white active:scale-95 transition-all cursor-pointer disabled:opacity-50"
      >
        <RefreshCw className={`h-3 w-3 text-slate-500 ${isRefreshing || agg.isFetching ? "animate-spin" : ""}`} />
        <span>Refresh Signals</span>
      </button>

      <button
        type="button"
        onClick={() => setIsBriefOpen(true)}
        className="hidden lg:inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3.5 py-1.5 text-[11.5px] font-semibold text-white shadow-2xs hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
      >
        <FileText className="h-3 w-3 text-emerald-400" />
        <span>Executive Brief</span>
      </button>

      <span className="pill hidden lg:inline-flex">
        <span className="font-semibold text-text-primary">Ministry / Nodal Officer</span>
        <span className="text-text-muted">·</span>
        <span>{session.displayName}</span>
      </span>

      <span className="relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-50 to-emerald-100 px-3.5 py-2 text-[11px] font-semibold text-emerald-800 shadow-sm">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <ShieldCheck className="h-3.5 w-3.5" />
        <span>{agg.data ? `${agg.data.stats.heisIntegrated} HEIs` : "…"}</span>
      </span>
    </>
  );

  return (
    <AppShell
      title="Mobility Intelligence"
      subtitle="Aggregate, privacy-preserving signal across the higher-education ecosystem"
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
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgb(26_42_82)] text-white shadow-sm">
              <BarChart3 className="h-5 w-5" />
            </span>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-700">
              Ministry Access · Read-only
            </p>
          </div>
          <h1 className="mt-4 font-display text-[32px] font-bold leading-tight tracking-tighter text-[rgb(26_42_82)] md:text-[38px]">
            Mobility Intelligence
          </h1>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-text-secondary">
            Aggregate friction patterns, mobility flows, and policy signals
            across the network. No PII. No cross-institution identification.
            Every signal derives from tamper-evident audit ledgers — computed
            live, not pre-baked.
          </p>
        </motion.header>

        {agg.isLoading ? (
          <div className="flex items-center justify-center gap-2 py-24 text-[13px] text-text-secondary">
            <Loader2 className="h-4 w-4 animate-spin" />
            Aggregating signals…
          </div>
        ) : agg.data ? (
          <MobilityIntelligence
            data={agg.data}
            isBriefOpen={isBriefOpen}
            setIsBriefOpen={setIsBriefOpen}
          />
        ) : (
          <div className="py-24 text-center text-[13px] text-text-secondary">Could not load aggregate data.</div>
        )}
      </section>

      <BottomStrip
        label={"National\nCoverage"}
        statusTitle={agg.data ? `${agg.data.stats.heisIntegrated} HEIs integrated · ${agg.data.stats.totalStudents} students tracked` : "Loading…"}
        statusIcon={<ShieldCheck className="h-4 w-4" />}
        ctaLabel="Export Policy Brief"
        onCta={() => setIsBriefOpen(true)}
      />
    </AppShell>
  );
}
