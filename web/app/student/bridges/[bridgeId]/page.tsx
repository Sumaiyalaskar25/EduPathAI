"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Calendar,
  Globe,
  GraduationCap,
  CheckCircle2,
  ClipboardCheck,
  Award,
  BookOpen,
  ShieldCheck,
  ExternalLink,
  ArrowRight,
  Zap,
  Target,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { BottomStrip } from "@/components/layout/BottomStrip";
import { DEMO_STUDENT, DEMO_CHAIN } from "@/lib/constants/demo";
import { getBridgeById, DEMO_BRIDGES } from "@/lib/constants/demo-bridges";
import { cn } from "@/lib/utils/cn";

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

const PROVIDER_GRADIENT: Record<string, string> = {
  NPTEL: "from-emerald-500 to-emerald-700",
  SWAYAM: "from-amber-500 to-amber-700",
  "V-Lab": "from-sky-500 to-sky-700",
};

export default function BridgeDetailPage() {
  const params = useParams<{ bridgeId: string }>();
  const bridge = getBridgeById(params?.bridgeId ?? "") ?? DEMO_BRIDGES[0];

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
      title="Bridge Course Detail"
      subtitle={`${bridge.provider} · ${bridge.title}`}
      topBarRight={topBarRight}
      reserveBottom
    >
      <section className="mx-auto max-w-[1200px] space-y-5 px-4 pb-4 pt-4 md:px-6">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            href="/student/pathways"
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-text-muted transition-colors hover:text-text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to pathways
          </Link>
        </motion.div>

        {/* Hero card */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="glass-strong relative overflow-hidden rounded-3xl p-8"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 45% 70% at 8% 20%, rgb(16 185 129 / 0.10) 0%, transparent 60%)",
            }}
          />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg",
                    PROVIDER_GRADIENT[bridge.provider] ?? "from-slate-500 to-slate-700"
                  )}
                >
                  <GraduationCap className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-text-muted">
                    {bridge.provider}
                  </p>
                  <p className="mt-0.5 text-[11.5px] font-medium text-text-secondary">
                    Bridge course · Level {bridge.level}
                  </p>
                </div>
              </div>

              <h1 className="mt-4 font-display text-[28px] font-bold leading-tight tracking-tighter text-text-primary md:text-[34px]">
                {bridge.title}
              </h1>

              <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-text-secondary">
                {bridge.description}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="pill">
                  <Clock className="h-3.5 w-3.5" />
                  {bridge.durationHours} hours
                </span>
                <span className="pill">
                  <Calendar className="h-3.5 w-3.5" />
                  {bridge.weeks} weeks
                </span>
                <span className="pill">
                  <Globe className="h-3.5 w-3.5" />
                  {bridge.language}
                </span>
                {bridge.assessmentAvailable && (
                  <span className="pill">
                    <ClipboardCheck className="h-3.5 w-3.5 text-emerald-600" />
                    Assessment included
                  </span>
                )}
                {bridge.institutionApproved && (
                  <span className="pill">
                    <Award className="h-3.5 w-3.5 text-emerald-600" />
                    Institution approved
                  </span>
                )}
                {bridge.selfPaced && (
                  <span className="pill">
                    <Zap className="h-3.5 w-3.5 text-amber-600" />
                    Self-paced
                  </span>
                )}
              </div>
            </div>

            {/* Coverage card */}
            <div className="shrink-0 rounded-2xl border border-border-subtle bg-white/70 p-5 md:w-[240px]">
              <p className="text-[10.5px] font-bold uppercase tracking-wider text-text-muted">
                Outcome coverage
              </p>
              <p className="mt-2 font-display text-[36px] font-bold leading-none tracking-tighter text-emerald-600 tabular-nums">
                {pct(bridge.coverage)}
              </p>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${bridge.coverage * 100}%` }}
                  transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                />
              </div>
              <p className="mt-3 text-[11px] leading-snug text-text-secondary">
                Of the missing competencies for this course gap.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Two-column detail row */}
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* Left column */}
          <div className="space-y-5">
            {/* Competencies */}
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="card-warm rounded-3xl p-7"
            >
              <header className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
                  <Target className="h-4 w-4 text-emerald-700" />
                </span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
                    Competencies covered
                  </p>
                  <h2 className="font-display text-[17px] font-bold tracking-tight text-text-primary">
                    What you'll learn
                  </h2>
                </div>
              </header>

              <ul className="mt-5 grid gap-2 md:grid-cols-2">
                {bridge.competencies.map((c, i) => (
                  <motion.li
                    key={c}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + i * 0.05, duration: 0.35 }}
                    className="flex items-start gap-2.5 rounded-xl border border-border-subtle bg-white/70 p-3.5"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span className="text-[13px] font-medium leading-snug text-text-primary">
                      {c}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </motion.section>

            {/* Prerequisites */}
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="card-warm rounded-3xl p-7"
            >
              <header className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100">
                  <BookOpen className="h-4 w-4 text-amber-700" />
                </span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
                    Prerequisites
                  </p>
                  <h2 className="font-display text-[17px] font-bold tracking-tight text-text-primary">
                    Recommended before starting
                  </h2>
                </div>
              </header>

              <ul className="mt-5 space-y-2">
                {bridge.prerequisites.map((p) => (
                  <li
                    key={p}
                    className="flex items-center gap-2.5 text-[13px] font-medium text-text-primary"
                  >
                    <span className="flex h-1.5 w-1.5 rounded-full bg-amber-500" />
                    {p}
                  </li>
                ))}
              </ul>
            </motion.section>
          </div>

          {/* Right column — sticky enrollment card */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="card-warm rounded-3xl p-6"
            >
              <div className="flex items-center gap-2 rounded-2xl bg-amber-50/70 p-3">
                <Calendar className="h-4 w-4 shrink-0 text-amber-700" />
                <p className="text-[11.5px] font-semibold leading-snug text-amber-900">
                  Enrollment closes {fmtDate(bridge.enrollmentDeadline)}
                </p>
              </div>

              <a
                href={bridge.resourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pill-navy mt-4 w-full justify-between"
              >
                <span>Enroll via {bridge.provider}</span>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
                  <ExternalLink className="h-3.5 w-3.5" />
                </span>
              </a>

              <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-border-strong bg-white/70 py-3 text-[13px] font-semibold text-text-primary transition-colors hover:bg-white">
                <ArrowRight className="h-4 w-4" />
                Add to academic plan
              </button>

              <div className="mt-6 border-t border-border-subtle pt-5">
                <p className="text-[10.5px] font-bold uppercase tracking-wider text-text-muted">
                  Satisfies gap
                </p>
                <ul className="mt-2 space-y-1.5">
                  {bridge.satisfiesGapIds.map((gap) => (
                    <li
                      key={gap}
                      className="flex items-center justify-between font-mono text-[11.5px] text-text-secondary"
                    >
                      <span>{gap}</span>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="rounded-3xl border border-emerald-200/70 bg-emerald-50/50 p-5"
            >
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-900">
                    Audit note
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-emerald-900/80">
                    Completing this bridge will automatically trigger a re-plan
                    and generate a new decision bundle on the audit ledger.
                  </p>
                </div>
              </div>
            </motion.div>
          </aside>
        </div>
      </section>

      <BottomStrip
        label={"Bridge\nReady"}
        statusTitle={`${bridge.provider} · ${bridge.durationHours}h · ${pct(bridge.coverage)} coverage`}
        statusIcon={<ShieldCheck className="h-4 w-4" />}
        ctaLabel="Enroll and continue"
      />
    </AppShell>
  );
}