"use client";

import { ShieldCheck, Landmark } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { BottomStrip } from "@/components/layout/BottomStrip";
import { ReviewQueue } from "@/components/hei/ReviewQueue";
import { HEI_NAV } from "@/components/layout/Sidebar";
import { DEMO_CHAIN } from "@/lib/constants/demo";

export default function HEIPage() {
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
      title="Board of Studies Review Queue"
      subtitle="Approve or reject AI-proposed recognition decisions"
      topBarRight={topBarRight}
      nav={HEI_NAV}
      reserveBottom
    >
      <section className="mx-auto max-w-[1400px] px-4 pb-4 pt-4 md:px-6">
        {/* Page header */}
        <header className="mb-6 max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgb(26_42_82)] text-white">
              <Landmark className="h-5 w-5" />
            </span>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-700">
              Institutional Reviewer Access
            </p>
          </div>
          <h1 className="mt-4 font-display text-[32px] font-bold leading-tight tracking-tighter text-[rgb(26_42_82)] md:text-[38px]">
            Review queue
          </h1>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-text-secondary">
            AI proposes structured recommendations. Rules decide the outcome.
            <span className="font-semibold text-text-primary">
              {" "}
              You are the structural gate.
            </span>{" "}
            Every approval or rejection is hash-chained to the audit ledger.
          </p>
        </header>

        <ReviewQueue />
      </section>

      <BottomStrip
        label={"Review\nSLA"}
        statusTitle="5 pending decisions · Target 24h turnaround"
        statusIcon={<ShieldCheck className="h-4 w-4" />}
        ctaLabel="Open Board Dashboard"
      />
    </AppShell>
  );
}