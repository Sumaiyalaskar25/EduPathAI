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
  TrendingUp,
  Users,
  ClipboardCheck,
  Sparkles,
  ArrowRight,
  Hash,
  ShieldCheck,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { BottomStrip } from "@/components/layout/BottomStrip";
import { DEMO_STUDENT, DEMO_CHAIN } from "@/lib/constants/demo";
import { getCourseById, DEMO_COURSES } from "@/lib/constants/demo-courses";
import { cn } from "@/lib/utils/cn";

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

const STATUS_STYLE = {
  DIRECT: {
    bg: "bg-emerald-100",
    fg: "text-emerald-800",
    Icon: CheckCircle2,
    label: "Direct match",
  },
  BRIDGE: {
    bg: "bg-amber-100",
    fg: "text-amber-900",
    Icon: AlertTriangle,
    label: "Bridge required",
  },
  MISSING: {
    bg: "bg-rose-100",
    fg: "text-rose-800",
    Icon: XCircle,
    label: "Missing",
  },
} as const;

export default function CourseDetailPage() {
  const params = useParams<{ courseId: string }>();
  const course = getCourseById(params?.courseId ?? "") ?? DEMO_COURSES[0];

  const status = STATUS_STYLE[course.recognitionStatus];
  const StatusIcon = status.Icon;

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
      title={`${course.code} · ${course.title}`}
      subtitle={course.semester}
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
                    {course.code}
                  </p>
                  <p className="mt-0.5 text-[11.5px] font-medium text-text-secondary">
                    {course.institution} · {course.credits} credits
                  </p>
                </div>
              </div>

              <h1 className="mt-4 font-display text-[28px] font-bold leading-tight tracking-tighter text-text-primary md:text-[34px]">
                {course.title}
              </h1>

              <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-text-secondary">
                {course.description}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="pill">
                  <ClipboardCheck className="h-3.5 w-3.5" />
                  {course.tag}
                </span>
                <span className="pill">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Bloom Level {course.bloomLevel}
                </span>
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
              </div>
            </div>

            {/* Recognition score card */}
            <div className="shrink-0 rounded-2xl border border-border-subtle bg-white/70 p-5 md:w-[240px]">
              <p className="text-[10.5px] font-bold uppercase tracking-wider text-text-muted">
                Recognition score
              </p>
              <p className="mt-2 font-display text-[36px] font-bold leading-none tracking-tighter text-text-primary tabular-nums">
                {course.mappedFrom
                  ? pct(course.mappedFrom.similarity)
                  : "—"}
              </p>
              <p className="mt-3 text-[11px] leading-snug text-text-secondary">
                {course.mappedFrom
                  ? `Mapped from ${course.mappedFrom.code} at ${course.mappedFrom.institution}`
                  : "Not mapped from any prior course"}
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

              <ul className="mt-5 grid gap-2 md:grid-cols-2">
                {course.competencies.map((c, i) => (
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
                    Courses required before this
                  </h2>
                </div>
              </header>

              <ul className="mt-5 space-y-2">
                {course.prerequisites.map((p) => (
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

          {/* Sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="card-warm rounded-3xl p-6"
            >
              <p className="text-[10.5px] font-bold uppercase tracking-wider text-text-muted">
                Assessment
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-text-primary">
                {course.assessedBy}
              </p>

              <div className="my-5 border-t border-border-subtle" />

              <p className="text-[10.5px] font-bold uppercase tracking-wider text-text-muted">
                Credits
              </p>
              <p className="mt-2 font-display text-[28px] font-bold leading-none tracking-tight text-text-primary tabular-nums">
                {course.credits}
              </p>

              {course.mappedFrom && (
                <>
                  <div className="my-5 border-t border-border-subtle" />
                  <p className="text-[10.5px] font-bold uppercase tracking-wider text-text-muted">
                    Mapped from
                  </p>
                  <div className="mt-2 flex items-start gap-2">
                    <Hash className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-muted" />
                    <div>
                      <p className="font-mono text-[12px] font-semibold text-text-primary">
                        {course.mappedFrom.code}
                      </p>
                      <p className="mt-0.5 text-[11px] text-text-muted">
                        {course.mappedFrom.institution}
                      </p>
                    </div>
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
                    AI rationale
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-emerald-900/80">
                    {course.recognitionStatus === "DIRECT"
                      ? "Strong outcome coverage and evidence quality across all competencies. Direct credit awarded."
                      : "Partial outcome coverage detected. A bridge course is recommended before credit is awarded."}
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
        statusTitle={`${course.code} · ${course.credits} credits · Bloom ${course.bloomLevel}`}
        statusIcon={<Award className="h-4 w-4" />}
        ctaLabel="Add to academic plan"
        ctaHref="/student/plan/update"
      />
    </AppShell>
  );
}