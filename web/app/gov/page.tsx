"use client";

import { motion } from "framer-motion";
import { BarChart3, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { BottomStrip } from "@/components/layout/BottomStrip";
import { MobilityIntelligence } from "@/components/gov/MobilityIntelligence";
import { GOV_NAV } from "@/components/layout/Sidebar";
import { DEMO_CHAIN } from "@/lib/constants/demo";

export default function GovPage() {
  const topBarRight = (
    <>
      <span className="pill hidden lg:inline-flex">
        <span className="font-semibold text-text-primary">
          Ministry / Nodal Officer
        </span>
        <span className="text-text-muted">·</span>
        <span>National View</span>
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
      title="Mobility Intelligence"
      subtitle="Aggregate, privacy-preserving signal across the higher-education ecosystem"
      topBarRight={topBarRight}
      nav={GOV_NAV}
      reserveBottom
    >
      <section className="mx-auto max-w-[1500px] px-4 pb-4 pt-4 md:px-6">
        {/* Page header */}
        <motion.header
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 max-w-3xl"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgb(26_42_82)] text-white">
              <BarChart3 className="h-5 w-5" />
            </span>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-700">
              Ministry Access · Read-only · National scale
            </p>
          </div>
          <h1 className="mt-4 font-display text-[32px] font-bold leading-tight tracking-tighter text-[rgb(26_42_82)] md:text-[38px]">
            Mobility Intelligence
          </h1>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-text-secondary">
            Aggregate friction patterns, mobility flows, and policy signals
            across Indian higher education. No PII. No cross-institution
            identification. Every signal derives from tamper-evident audit
            ledgers.
          </p>
        </motion.header>

        <MobilityIntelligence />
      </section>

      <BottomStrip
        label={"National\nCoverage"}
        statusTitle="840 HEIs integrated · 1.42M students · 100% chain integrity"
        statusIcon={<ShieldCheck className="h-4 w-4" />}
        ctaLabel="Export Policy Brief"
      />
    </AppShell>
  );
}