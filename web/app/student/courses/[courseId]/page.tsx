"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Target,
  Award,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ShieldAlert,
  ClipboardCheck,
  Sparkles,
  ArrowRight,
  Hash,
  ShieldCheck,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { BottomStrip } from "@/components/layout/BottomStrip";
import { CardSkeleton } from "@/components/feedback/Skeleton";
import { useRequireRole } from "@/lib/hooks/useRequireRole";
import { useCourse, useStudentProfile } from "@/lib/api/hooks";
import type { RecognitionStatus } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";

const STATUS_STYLE: Record<RecognitionStatus, { bg: string; fg: string; Icon: typeof CheckCircle2; label: string }> = {
  DIRECT: { bg: "bg-emerald-100", fg: "text-emerald-800", Icon: CheckCircle2, label: "Direct match" },
  BRIDGE: { bg: "bg-amber-100", fg: "text-amber-900", Icon: AlertTriangle, label: "Bridge required" },
  MISSING: { bg: "bg-rose-100", fg: "text-rose-800", Icon: XCircle, label: "Missing" },
  REVIEW: { bg: "bg-sky-100", fg: "text-sky-800", Icon: HelpCircle, label: "Review required" },
  POLICY_CONFLICT: { bg: "bg-rose-100", fg: "text-rose-800", Icon: ShieldAlert, label: "Policy conflict" },
};

export default function CourseDetailPage() {
  const params = useParams<{ courseId: string }>();
  const session = useRequireRole("learner");
  const course = useCourse(params?.courseId);
  const profile = useStudentProfile(session?.externalRef);

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

  if (course.isLoading) {
    return (
      <AppShell title="Course Detail" subtitle="Loading…" topBarRight={topBarRight} reserveBottom>
        <section className="mx-auto max-w-[1200px] space-y-5 px-4 pb-4 pt-4 md:px-6">
          <CardSkeleton />
          <CardSkeleton />
        </section>
      </AppShell>
    );
  }

  if (course.isError || !course.data) {
    return (
      <AppShell title="Course Detail" subtitle="Not found" topBarRight={topBarRight} reserveBottom>
        <section className="mx-auto max-w-[1200px] space-y-5 px-4 pb-4 pt-4 md:px-6">
          <div className="card-warm rounded-3xl p-8 text-center">
            <p className="text-[14px] font-semibold text-text-primary">
              We couldn't load this course.
            </p>
            <p className="mt-2 text-[12.5px] text-text-secondary">
              {course.error instanceof Error
                ? course.error.message
                : "It isn't in the course catalog yet."}
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

  const c = course.data;
  const status = c.recognitionStatus ? STATUS_STYLE[c.recognitionStatus] : null;
  const StatusIcon = status?.Icon;

  return (
    <AppShell
      title={`${c.code} · ${c.name}`}
      subtitle={c.modality}
      topBarRight={topBarRight}
      reserveBottom
    >
      <section className="mx-auto max-w-[1200px] space-y-5 px-4 pb-4 pt-4 md:px-6">
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

        {/* Hero */}
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
                "radial-gradient(ellipse 45% 70% at 8% 20%, rgb(26 42 82 / 0.10) 0%, transparent 60%)",
            }}
          />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[rgb(26_42_82)] to-[rgb(14_22_48)] text-white shadow-lg">
                  <BookOpen className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-text-muted">
                    {c.code}
                  </p>
                  <p className="mt-0.5 text-[11.5px] font-medium text-text-secondary">
                    {c.credits} credits · {c.modality}
                  </p>
                </div>
              </div>

              <h1 className="mt-4 font-display text-[28px] font-bold leading-tight tracking-tighter text-text-primary md:text-[34px]">
                {c.name}
              </h1>

              <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-text-secondary">
                {c.description}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="pill">
                  <ClipboardCheck className="h-3.5 w-3.5" />
                  {c.modality}
                </span>
                {status && StatusIcon && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider",
                      status.bg,
                      status.fg
                    )}
                  >
                    <StatusIcon className="h-3 w-3" />
                    {status.label}
                  </span>
                )}
              </div>
            </div>

            {/* Recognition score card */}
            <div className="shrink-0 rounded-2xl border border-border-subtle bg-white/70 p-5 md:w-[240px]">
              <p className="text-[10.5px] font-bold uppercase tracking-wider text-text-muted">
                Recognition score
              </p>
              <p className="mt-2 font-display text-[36px] font-bold leading-none tracking-tighter text-text-primary tabular-nums">
                {c.mappedFrom ? `${Math.round(c.mappedFrom.similarity * 100)}%` : "—"}
              </p>
              <p className="mt-3 text-[11px] leading-snug text-text-secondary">
                {c.mappedFrom
                  ? `Mapped from ${c.mappedFrom.source_course}`
                  : "Not mapped from any prior course yet"}
              </p>
            </div>
          </div>
        </motion.section>

        {/* Two-column */}
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
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
                    Learning Outcomes
                  </p>
                  <h2 className="font-display text-[17px] font-bold tracking-tight text-text-primary">
                    Competencies you'll gain
                  </h2>
                </div>
              </header>

              {c.competencies.length > 0 ? (
                <ul className="mt-5 grid gap-2 md:grid-cols-2">
                  {c.competencies.map((comp, i) => (
                    <motion.li
                      key={comp}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + i * 0.05, duration: 0.35 }}
                      className="flex items-start gap-2.5 rounded-xl border border-border-subtle bg-white/70 p-3.5"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span className="text-[13px] font-medium leading-snug text-text-primary">
                        {comp}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-[12.5px] text-text-secondary">
                  No learning outcomes on file for this course yet.
                </p>
              )}
            </motion.section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="card-warm rounded-3xl p-6"
            >
              <p className="text-[10.5px] font-bold uppercase tracking-wider text-text-muted">
                Modality
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-text-primary">
                {c.modality}
              </p>

              <div className="my-5 border-t border-border-subtle" />

              <p className="text-[10.5px] font-bold uppercase tracking-wider text-text-muted">
                Credits
              </p>
              <p className="mt-2 font-display text-[28px] font-bold leading-none tracking-tight text-text-primary tabular-nums">
                {c.credits}
              </p>

              {c.mappedFrom && (
                <>
                  <div className="my-5 border-t border-border-subtle" />
                  <p className="text-[10.5px] font-bold uppercase tracking-wider text-text-muted">
                    Mapped from
                  </p>
                  <div className="mt-2 flex items-start gap-2">
                    <Hash className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-muted" />
                    <p className="font-mono text-[12px] font-semibold text-text-primary">
                      {c.mappedFrom.source_course}
                    </p>
                  </div>
                </>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="rounded-3xl border border-emerald-200/70 bg-emerald-50/50 p-5"
            >
              <div className="flex items-start gap-2.5">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-900">
                    Recognition status
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-emerald-900/80">
                    {c.recognitionStatus === "DIRECT" &&
                      "Strong outcome coverage and evidence quality. Direct credit awarded."}
                    {c.recognitionStatus === "BRIDGE" &&
                      "Partial outcome coverage detected. A bridge course is recommended before credit is awarded."}
                    {c.recognitionStatus === "MISSING" &&
                      "No matching prior coursework found for this course yet."}
                    {c.recognitionStatus === "REVIEW" &&
                      "Evidence quality is inconclusive — this needs manual review before a decision is finalized."}
                    {c.recognitionStatus === "POLICY_CONFLICT" &&
                      "Semantic match found, but an institutional policy currently blocks recognition."}
                    {!c.recognitionStatus &&
                      "No recognition decision exists for this course yet — run a pathway analysis to generate one."}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
            >
              <Link
                href="/student/gaps"
                className="pill-navy w-full justify-between"
              >
                <span>View related gaps</span>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </motion.div>
          </aside>
        </div>
      </section>

      <BottomStrip
        label={"Course\nDetail"}
        statusTitle={`${c.code} · ${c.credits} credits · ${c.modality}`}
        statusIcon={<Award className="h-4 w-4" />}
        ctaLabel="Update academic plan"
        ctaHref="/student/plan/update"
      />
    </AppShell>
  );
}
