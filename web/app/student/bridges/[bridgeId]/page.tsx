"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Clock,
  Calendar,
  GraduationCap,
  CheckCircle2,
  ClipboardCheck,
  Award,
  BookOpen,
  ShieldCheck,
  ExternalLink,
  ArrowRight,
  Target,
  Loader2,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { BottomStrip } from "@/components/layout/BottomStrip";
import { CardSkeleton } from "@/components/feedback/Skeleton";
import { useRequireRole } from "@/lib/hooks/useRequireRole";
import { useBridge, useStudentProfile, useAddToPlan } from "@/lib/api/hooks";
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
  VLAB: "from-sky-500 to-sky-700",
  HEI: "from-indigo-500 to-indigo-700",
};

export default function BridgeDetailPage() {
  const params = useParams<{ bridgeId: string }>();
  const session = useRequireRole("learner");
  const bridge = useBridge(params?.bridgeId);
  const profile = useStudentProfile(session?.externalRef);
  const addToPlan = useAddToPlan();

  if (!session) return null;

  const topBarRight = (
    <>
      <span className="pill hidden lg:inline-flex">
        <span className="font-semibold text-text-primary">{session.externalRef}</span>
        <span className="text-text-muted">·</span>
        <span>{session.programme}</span>
      </span>
      {profile.data && (
        <span className="relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-50 to-emerald-100 px-3.5 py-2 text-[11px] font-semibold text-emerald-800 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <ShieldCheck className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Chain Integrity:</span>
          <span>{profile.data.security.chain_integrity}</span>
        </span>
      )}
    </>
  );

  if (bridge.isLoading) {
    return (
      <AppShell title="Bridge Course Detail" subtitle="Loading…" topBarRight={topBarRight} reserveBottom>
        <section className="mx-auto max-w-[1200px] space-y-5 px-4 pb-4 pt-4 md:px-6">
          <CardSkeleton />
          <CardSkeleton />
        </section>
      </AppShell>
    );
  }

  if (bridge.isError || !bridge.data) {
    return (
      <AppShell title="Bridge Course Detail" subtitle="Not found" topBarRight={topBarRight} reserveBottom>
        <section className="mx-auto max-w-[1200px] space-y-5 px-4 pb-4 pt-4 md:px-6">
          <div className="card-warm rounded-3xl p-8 text-center">
            <p className="text-[14px] font-semibold text-text-primary">
              We couldn't load this bridge course.
            </p>
            <p className="mt-2 text-[12.5px] text-text-secondary">
              {bridge.error instanceof Error
                ? bridge.error.message
                : "It may no longer be available, or the link is out of date."}
            </p>
            <Link
              href="/student/pathways"
              className="mt-5 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-navy-700 hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to pathways
            </Link>
          </div>
        </section>
      </AppShell>
    );
  }

  const b = bridge.data;

  return (
    <AppShell
      title="Bridge Course Detail"
      subtitle={`${b.resource_provider} · ${b.title}`}
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
                    PROVIDER_GRADIENT[b.resource_provider] ?? "from-slate-500 to-slate-700"
                  )}
                >
                  <GraduationCap className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-text-muted">
                    {b.resource_provider}
                  </p>
                  <p className="mt-0.5 text-[11.5px] font-medium text-text-secondary">
                    Bridge course · {b.recognition_status === "FORMAL_BRIDGE" ? "Credit-granting" : "Learning only"}
                  </p>
                </div>
              </div>

              <h1 className="mt-4 font-display text-[28px] font-bold leading-tight tracking-tighter text-text-primary md:text-[34px]">
                {b.title}
              </h1>

              {b.gap?.description && (
                <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-text-secondary">
                  {b.gap.description}
                </p>
              )}

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="pill">
                  <Clock className="h-3.5 w-3.5" />
                  {b.duration_hours} hours
                </span>
                {b.assessment_available && (
                  <span className="pill">
                    <ClipboardCheck className="h-3.5 w-3.5 text-emerald-600" />
                    Assessment included
                  </span>
                )}
                {b.recognition_status === "FORMAL_BRIDGE" && (
                  <span className="pill">
                    <Award className="h-3.5 w-3.5 text-emerald-600" />
                    Formal credit bridge
                  </span>
                )}
                {b.prerequisite_met ? (
                  <span className="pill">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Prerequisites met
                  </span>
                ) : (
                  <span className="pill">
                    <BookOpen className="h-3.5 w-3.5 text-amber-600" />
                    Prerequisites pending
                  </span>
                )}
                {b.enrolled && (
                  <span className="pill">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Already in your plan
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
                {pct(b.competency_coverage)}
              </p>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${b.competency_coverage * 100}%` }}
                  transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                />
              </div>
              <p className="mt-3 text-[11px] leading-snug text-text-secondary">
                Of the missing competencies for this gap.
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

              {b.competencies.length > 0 ? (
                <ul className="mt-5 grid gap-2 md:grid-cols-2">
                  {b.competencies.map((c, i) => (
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
              ) : (
                <p className="mt-4 text-[12.5px] text-text-secondary">
                  No competency tags on file for this resource yet.
                </p>
              )}
            </motion.section>

            {/* Missing outcomes this bridge addresses */}
            {b.gap && b.gap.missing_outcomes.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.5 }}
                className="card-warm rounded-3xl p-7"
              >
                <header className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100">
                    <Target className="h-4 w-4 text-sky-700" />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
                      Gap {b.gap.gap_type.toLowerCase()}
                    </p>
                    <h2 className="font-display text-[17px] font-bold tracking-tight text-text-primary">
                      Outcomes this bridge closes
                    </h2>
                  </div>
                </header>
                <ul className="mt-5 space-y-2">
                  {b.gap.missing_outcomes.map((o) => (
                    <li key={o} className="flex items-start gap-2.5 text-[13px] font-medium text-text-primary">
                      <span className="mt-1.5 flex h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
                      {o}
                    </li>
                  ))}
                </ul>
              </motion.section>
            )}

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

              {b.prerequisites.length > 0 ? (
                <ul className="mt-5 space-y-2">
                  {b.prerequisites.map((p) => (
                    <li
                      key={p}
                      className="flex items-center gap-2.5 text-[13px] font-medium text-text-primary"
                    >
                      <span className="flex h-1.5 w-1.5 rounded-full bg-amber-500" />
                      {p}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-[12.5px] text-text-secondary">
                  No prerequisites on file — you can start immediately.
                </p>
              )}
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
              {b.valid_until && (
                <div className="flex items-center gap-2 rounded-2xl bg-amber-50/70 p-3">
                  <Calendar className="h-4 w-4 shrink-0 text-amber-700" />
                  <p className="text-[11.5px] font-semibold leading-snug text-amber-900">
                    Catalog entry valid until {fmtDate(b.valid_until)}
                  </p>
                </div>
              )}

              <a
                href={b.resource_url}
                target="_blank"
                rel="noopener noreferrer"
                className="pill-navy mt-4 w-full justify-between"
              >
                <span>Enroll via {b.resource_provider}</span>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
                  <ExternalLink className="h-3.5 w-3.5" />
                </span>
              </a>

              <button
                type="button"
                disabled={b.enrolled || addToPlan.isPending}
                onClick={() => {
                  addToPlan.mutate(
                    { studentId: session.externalRef, bridgeId: b.id },
                    {
                      onSuccess: () => toast.success("Added to your academic plan"),
                      onError: () => toast.error("Couldn't add this bridge to your plan — try again."),
                    }
                  );
                }}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-border-strong bg-white/70 py-3 text-[13px] font-semibold text-text-primary transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {addToPlan.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Adding…
                  </>
                ) : b.enrolled ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Already in plan
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-4 w-4" />
                    Add to academic plan
                  </>
                )}
              </button>

              <div className="mt-6 border-t border-border-subtle pt-5">
                <p className="text-[10.5px] font-bold uppercase tracking-wider text-text-muted">
                  Satisfies gap
                </p>
                <p className="mt-2 flex items-center justify-between font-mono text-[11.5px] text-text-secondary">
                  <span>{b.gap_id}</span>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                </p>
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
                    Adding this bridge is recorded against your academic plan and
                    will be visible in your audit history.
                  </p>
                </div>
              </div>
            </motion.div>
          </aside>
        </div>
      </section>

      <BottomStrip
        label={"Bridge\nReady"}
        statusTitle={`${b.resource_provider} · ${b.duration_hours}h · ${pct(b.competency_coverage)} coverage`}
        statusIcon={<ShieldCheck className="h-4 w-4" />}
        ctaLabel={b.enrolled ? "View academic plan" : "Add to plan and continue"}
        ctaHref={b.enrolled ? "/student/plan/update" : undefined}
        onCta={
          b.enrolled
            ? undefined
            : () =>
              addToPlan.mutate(
                { studentId: session.externalRef, bridgeId: b.id },
                {
                  onSuccess: () => toast.success("Added to your academic plan"),
                  onError: () => toast.error("Couldn't add this bridge to your plan — try again."),
                }
              )
        }
      />
    </AppShell>
  );
}
