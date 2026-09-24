"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Hash, ShieldCheck, Sparkles, Database, CheckCircle2 } from "lucide-react";
import { AuthTopBar } from "@/components/auth/AuthTopBar";
import { IdentityModeSelector } from "@/components/auth/IdentityModeSelector";
import { DigiLockerAccess } from "@/components/auth/DigiLockerAccess";
import { NationalStatsBar } from "@/components/auth/NationalStatsBar";
import {
  IDENTITY_OPTIONS,
  AUTH_BADGES,
  type IdentityMode,
} from "@/lib/constants/auth-ui";
import { useAuthOverview } from "@/lib/api/hooks";

export default function LoginPage() {
  const [mode, setMode] = useState<IdentityMode>("learner");
  const modeLabel =
    IDENTITY_OPTIONS.find((o) => o.key === mode)?.label ?? "Learner";

  const { data: overviewData, isLoading: isOverviewLoading } = useAuthOverview();

  const personasCount = {
    learner: overviewData?.personas?.learner?.length ?? 5,
    bos: overviewData?.personas?.bos?.length ?? 3,
    ministry: overviewData?.personas?.ministry?.length ?? 1,
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#faf8f5]">
      {/* Background ambient lighting */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-[15%] left-[5%] h-[550px] w-[550px] rounded-full bg-blue-300/18 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] h-[600px] w-[600px] rounded-full bg-amber-300/14 blur-[140px]" />
        <div className="absolute -bottom-[20%] left-[30%] h-[650px] w-[650px] rounded-full bg-emerald-300/12 blur-[150px]" />
      </div>

      <AuthTopBar onSelectRole={setMode} isLive={overviewData?.stats?.db === "connected"} />

      {/* Main content */}
      <main className="relative mx-auto flex min-h-screen max-w-[1440px] flex-col justify-center px-4 pb-16 pt-32 md:px-8">
        {/* Hero copy */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mb-8 max-w-4xl text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/70 bg-emerald-50/80 px-4 py-1.5 shadow-2xs backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-[11.5px] font-bold uppercase tracking-[0.2em] text-emerald-800">
              National Academic Mobility Engine · NEP 2020 &amp; NCrF
            </span>
          </div>

          <h1 className="mt-5 font-display text-[44px] font-extrabold leading-[1.04] tracking-tight text-[rgb(26_42_82)] md:text-[62px]">
            Intelligent Academic Mobility.
            <br />
            <span className="bg-gradient-to-r from-[rgb(26_42_82)] via-blue-900 to-indigo-800 bg-clip-text text-transparent">
              Tamper-Proof Recognition.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-[16px] font-normal leading-relaxed text-slate-600">
            India's unified semantic engine for verifiable credit transfer, syllabus
            alignment, and automated learning-outcome equivalence across higher education.
          </p>
        </motion.div>

        {/* Dynamic Live National Stats Bar */}
        <NationalStatsBar data={overviewData} isLoading={isOverviewLoading} />

        {/* Two-card grid */}
        <div className="mx-auto grid w-full max-w-[1200px] gap-6 lg:grid-cols-2">
          <IdentityModeSelector
            selected={mode}
            onChange={setMode}
            personasCount={personasCount}
          />
          <DigiLockerAccess
            mode={mode}
            modeLabel={modeLabel}
            personas={overviewData?.personas}
          />
        </div>

        {/* Bottom row — live audit proof & trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mx-auto mt-10 flex w-full max-w-[1200px] flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200/60 bg-white/60 p-4 backdrop-blur-sm md:flex-row"
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgb(26_42_82)] px-3.5 py-1.5 text-[11px] font-semibold text-white shadow-xs">
              <Hash className="h-3.5 w-3.5 text-blue-300" />
              {AUTH_BADGES.hashVerified}
            </span>

            <span className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-white px-3.5 py-1.5 shadow-2xs">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-primary">
                {AUTH_BADGES.certification}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                {AUTH_BADGES.certificationSub}
              </span>
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1.5 text-[11px] font-semibold text-blue-800">
              <Database className="h-3.5 w-3.5 text-blue-600" />
              <span>15,600+ Courses Ingested</span>
            </span>
          </div>

          <p className="text-center text-[11.5px] font-medium leading-snug text-slate-500 md:text-right">
            Development Identity Gateway · Live PostgreSQL Persistence<br className="hidden md:block" />
            Tokens cryptographically chained into SHA-256 Merkle Ledger.
          </p>
        </motion.div>
      </main>
    </div>
  );
}