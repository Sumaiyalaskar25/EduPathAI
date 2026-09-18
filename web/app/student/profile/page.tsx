"use client";

import { AppShell } from "@/components/layout/AppShell";
import { BottomStrip } from "@/components/layout/BottomStrip";
import { ProfilePanel } from "@/components/profile/ProfilePanel";
import { DEMO_STUDENT, DEMO_CHAIN } from "@/lib/constants/demo";
import { ShieldCheck } from "lucide-react";

export default function ProfilePage() {
  const topBarRight = (
    <>
      <span className="pill hidden lg:inline-flex">
        <span className="font-semibold text-text-primary">
          APAAR: {DEMO_STUDENT.apaar}
        </span>
        <span className="text-text-muted">·</span>
        <span>{DEMO_STUDENT.programme}</span>
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
      title="Profile"
      subtitle="Identity, consent, and decision history"
      topBarRight={topBarRight}
      reserveBottom
    >
      <section className="mx-auto max-w-[1700px] px-4 pb-4 pt-4 md:px-6">
        <ProfilePanel />
      </section>

      <BottomStrip
        label={"Account\nHealth"}
        statusTitle="All consents active · MFA enabled · Chain verified"
        statusIcon={<ShieldCheck className="h-4 w-4" />}
        ctaLabel="Download Full Audit Report"
      />
    </AppShell>
  );
}