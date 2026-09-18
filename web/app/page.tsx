"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Hash, ShieldCheck } from "lucide-react";
import { AuthTopBar } from "@/components/auth/AuthTopBar";
import { IdentityModeSelector } from "@/components/auth/IdentityModeSelector";
import { DigiLockerAccess } from "@/components/auth/DigiLockerAccess";
import {
  IDENTITY_OPTIONS,
  DEMO_AUTH_BADGES,
  type IdentityMode,
} from "@/lib/constants/demo-auth";

export default function LoginPage() {
  const [mode, setMode] = useState<IdentityMode>("learner");
  const modeLabel =
    IDENTITY_OPTIONS.find((o) => o.key === mode)?.label ?? "Learner";

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background mesh */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 65% at 8% 25%, rgb(30 100 160 / 0.14) 0%, transparent 60%), radial-gradient(ellipse 55% 65% at 92% 30%, rgb(245 158 11 / 0.10) 0%, transparent 60%), radial-gradient(ellipse 80% 40% at 50% 110%, rgb(232 220 200 / 0.35) 0%, transparent 70%)",
        }}
      />

      <AuthTopBar />

      {/* Main content */}
      <main className="relative mx-auto flex min-h-screen max-w-[1400px] flex-col justify-center px-4 pb-16 pt-28 md:px-8">
        {/* Hero copy */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mb-10 max-w-3xl text-center"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-700">
            Academic Mobility · National Scale
          </p>
          <h1 className="mt-4 font-display text-[40px] font-bold leading-[1.05] tracking-tighter text-[rgb(26_42_82)] md:text-[54px]">
            Intelligent Academic Mobility.
            <br />
            <span className="text-gradient-navy">Tamper-Proof Recognition.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-text-secondary">
            The National AI-driven engine for seamless credit transfer,
            alignment, and authentication across India's higher education
            ecosystem.
          </p>
        </motion.div>

        {/* Two-card grid */}
        <div className="mx-auto grid w-full max-w-[1200px] gap-5 lg:grid-cols-2">
          <IdentityModeSelector selected={mode} onChange={setMode} />
   <DigiLockerAccess mode={mode} modeLabel={modeLabel} />
        </div>

        {/* Bottom row — badges + cert */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mx-auto mt-8 flex w-full max-w-[1200px] flex-col items-center justify-between gap-4 md:flex-row"
        >
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgb(26_42_82)] px-3.5 py-2 text-[11px] font-semibold text-white">
              <Hash className="h-3.5 w-3.5" />
              {DEMO_AUTH_BADGES.hashVerified}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-white/80 px-3.5 py-2">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-primary">
                {DEMO_AUTH_BADGES.certification}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-text-muted">
                {DEMO_AUTH_BADGES.certificationSub}
              </span>
            </span>
          </div>

          <p className="text-center text-[11.5px] font-medium leading-snug text-text-muted md:text-right">
            Read-only integration with DigiLocker & ABC ·<br className="hidden md:block" />
            EduPathAI never writes to national infrastructure.
          </p>
        </motion.div>
      </main>
    </div>
  );
}