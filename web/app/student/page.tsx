"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  GraduationCap,
  GitBranch,
  CalendarRange,
  Target,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Play,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { BottomStrip } from "@/components/layout/BottomStrip";
import { RecognizedBadge } from "@/components/pathways/RecognizedBadge";
import { cn } from "@/lib/utils/cn";
import { useRequireRole } from "@/lib/hooks/useRequireRole";
import { useRunPathway, useStudentProfile } from "@/lib/api/hooks";
import type { DecisionHistoryItem, RecognitionSummary } from "@/lib/api/types";

/* ───── helpers ───── */

function fmtDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

/* ───── 1. HERO ───── */

function Hero({ firstName }: { firstName: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="glass-strong relative overflow-hidden rounded-3xl p-8 md:p-10"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 45% 70% at 8% 20%, rgb(16 185 129 / 0.10) 0%, transparent 60%), radial-gradient(ellipse 40% 65% at 92% 18%, rgb(26 42 82 / 0.10) 0%, transparent 55%)",
        }}
      />

      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-700">
            Student Dashboard
          </p>
          <h1 className="mt-3 font-display text-[36px] font-bold leading-none tracking-tighter text-[rgb(26_42_82)] md:text-[44px]">
            Welcome back, {firstName}.
          </h1>
          <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-text-secondary">
            Your academic pathway is updated. Review your recommended pathway
            before the next Board of Studies window.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-3">
          <Link href="/student/pathways" className="pill-navy">
            <Sparkles className="h-4 w-4" />
            <span>Review pathway</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/student/gaps"
            className="flex items-center gap-2 rounded-full border border-border-subtle bg-white/70 px-5 py-3 text-[13px] font-semibold text-text-primary transition-colors hover:bg-white"
          >
            View gaps
          </Link>
        </div>
      </div>
    </motion.section>
  );
}

/* ───── 2. STATS ROW ───── */

function StatsRow({
  recognized,
  bridges,
  semsRemaining,
  alignment,
}: {
  recognized: number;
  bridges: number;
  semsRemaining: number;
  alignment: number;
}) {
  const items = [
    { key: "recognized", label: "Credits Recognized", value: recognized, suffix: "", tone: "emerald", Icon: GraduationCap },
    { key: "bridges", label: "Bridges Required", value: bridges, suffix: "", tone: "amber", Icon: GitBranch },
    { key: "sems", label: "Semesters Left", value: semsRemaining, suffix: "", tone: "navy", Icon: CalendarRange },
    { key: "alignment", label: "Content Alignment", value: alignment, suffix: "%", tone: "emerald", Icon: Target },
  ] as const;

  const toneMap = {
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    navy: "text-[rgb(26_42_82)]",
  };

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {items.map((item, i) => (
        <motion.div
          key={item.key}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.06, duration: 0.45 }}
          className="card-warm flex flex-col gap-3 p-5"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-text-muted">
              {item.label}
            </span>
            <item.Icon className={cn("h-4 w-4", toneMap[item.tone])} />
          </div>
          <div className="flex items-baseline gap-1">
            <span
              className={cn(
                "font-display text-[34px] font-bold leading-none tracking-tight tabular-nums",
                toneMap[item.tone]
              )}
            >
              {item.value}
            </span>
            <span className={cn("text-[14px] font-semibold", toneMap[item.tone])}>
              {item.suffix}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ───── 3. RECOGNITION BREAKDOWN ───── */

const BREAKDOWN_COLORS: Record<string, string> = {
  Direct: "#10b981",
  Bridge: "#f59e0b",
  Missing: "#f43f5e",
  Review: "#64748b",
  "Policy Conflict": "#7c3aed",
};

function RecognitionBreakdown({ recognition }: { recognition: RecognitionSummary }) {
  const items = [
    { name: "Direct", value: recognition.direct },
    { name: "Bridge", value: recognition.bridge },
    { name: "Missing", value: recognition.missing },
    { name: "Review", value: recognition.review },
    { name: "Policy Conflict", value: recognition.policy_conflict },
  ].filter((d) => d.value > 0);
  const total = items.reduce((s, d) => s + d.value, 0) || 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.5 }}
      className="card-warm p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
            Recognition Breakdown
          </p>
          <h3 className="mt-1 font-display text-[18px] font-bold tracking-tight text-text-primary">
            {total} course{total === 1 ? "" : "s"} mapped
          </h3>
        </div>
        <Link
          href="/student/audit"
          className="flex items-center gap-1 text-[12px] font-semibold text-emerald-700 hover:underline"
        >
          Full ledger
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="mt-5 flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        {items.map((item, i) => (
          <motion.div
            key={item.name}
            initial={{ width: 0 }}
            animate={{ width: `${(item.value / total) * 100}%` }}
            transition={{ delay: 0.5 + i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ backgroundColor: BREAKDOWN_COLORS[item.name] }}
          />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 md:grid-cols-4">
        {items.map((item) => {
          const pct = Math.round((item.value / total) * 100);
          return (
            <div key={item.name} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: BREAKDOWN_COLORS[item.name] }} />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                {item.name}
              </span>
              <span className="ml-auto font-mono text-[12px] font-semibold tabular-nums text-text-primary">
                {item.value}
              </span>
              <span className="w-8 text-right font-mono text-[10.5px] tabular-nums text-text-muted">
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ───── 4. CONTINUE WHERE YOU LEFT OFF ───── */

const STATUS_ICON: Record<string, typeof CheckCircle2> = {
  APPROVED: CheckCircle2,
  PENDING: Clock,
  REJECTED: AlertTriangle,
  CONTESTED: AlertTriangle,
};

const STATUS_STYLE: Record<string, string> = {
  APPROVED: "bg-emerald-100 text-emerald-800",
  PENDING: "bg-amber-100 text-amber-900",
  REJECTED: "bg-rose-100 text-rose-800",
  CONTESTED: "bg-rose-100 text-rose-800",
};

function ContinueWhereYouLeftOff({ latest }: { latest: DecisionHistoryItem | undefined }) {
  if (!latest) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.5 }}
        className="card-warm flex h-full flex-col items-center justify-center gap-3 p-6 text-center"
      >
        <p className="text-[13px] text-text-secondary">
          No decisions yet — run a pathway analysis to get started.
        </p>
        <Link href="/student/pathways" className="pill-navy">
          <Sparkles className="h-4 w-4" />
          <span>Review pathway</span>
        </Link>
      </motion.div>
    );
  }

  const Icon = STATUS_ICON[latest.status] ?? Clock;
  const chip = STATUS_STYLE[latest.status] ?? STATUS_STYLE.PENDING;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.5 }}
      className="card-warm flex h-full flex-col p-6"
    >
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
          Continue where you left off
        </p>
        <h3 className="mt-1 font-display text-[18px] font-bold tracking-tight text-text-primary">
          Latest decision
        </h3>
      </div>

      <div className="mt-5 flex-1">
        <Link
          href={`/student/audit/${latest.decision_id}`}
          className="group flex h-full flex-col gap-4 rounded-2xl border border-border-subtle bg-white/70 p-5 transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-3">
            <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", chip)}>
              <Icon className="h-4 w-4" />
            </span>
            <span className={cn("rounded-full px-2.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider", chip)}>
              {latest.status}
            </span>
          </div>

          <div>
            <p className="text-[14px] font-semibold leading-snug tracking-tight text-text-primary">
              {latest.summary}
            </p>
            <p className="mt-1.5 font-mono text-[10.5px] text-text-muted">
              {latest.decision_id.slice(0, 14)}… · {fmtDateTime(latest.decided_at)}
            </p>
          </div>

          <div className="mt-auto flex items-center gap-2 border-t border-border-subtle/60 pt-3 text-[12px] font-semibold text-emerald-700">
            <Play className="h-3.5 w-3.5" />
            <span>Replay decision</span>
            <ArrowRight className="ml-auto h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </div>
        </Link>
      </div>

      <Link
        href="/student/audit"
        className="mt-4 flex items-center justify-between gap-2 rounded-2xl border border-border-subtle bg-canvas/60 px-4 py-3 text-[12px] font-semibold text-text-secondary transition-colors hover:bg-white hover:text-text-primary"
      >
        <span>View full decision history</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </motion.div>
  );
}

/* ───── 5. QUICK ACTIONS ───── */

const QUICK_ACTIONS = [
  { href: "/student/tree", label: "Academic Tree", sub: "Competency explorer", Icon: TrendingUp, tone: "emerald" },
  { href: "/student/pathways", label: "Pathways", sub: "Routes to graduation", Icon: GitBranch, tone: "navy" },
  { href: "/student/gaps", label: "Gap Analysis", sub: "Bridges & outcomes", Icon: Target, tone: "amber" },
  { href: "/student/profile", label: "Profile", sub: "Identity & consents", Icon: GraduationCap, tone: "navy" },
] as const;

function QuickActions() {
  const tones = {
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    navy: "bg-[rgb(26_42_82)]/10 text-[rgb(26_42_82)]",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55, duration: 0.5 }}
      className="card-warm flex h-full flex-col p-6"
    >
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
          Quick Actions
        </p>
        <h3 className="mt-1 font-display text-[18px] font-bold tracking-tight text-text-primary">
          Jump to
        </h3>
      </div>

      <div className="mt-5 grid flex-1 grid-cols-2 gap-3">
        {QUICK_ACTIONS.map((a, i) => (
          <motion.div
            key={a.href}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 + i * 0.05, duration: 0.4 }}
          >
            <Link
              href={a.href}
              className="group flex h-full flex-col gap-3 rounded-2xl border border-border-subtle bg-white/70 p-4 transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
            >
              <span className={cn("flex h-9 w-9 items-center justify-center rounded-full", tones[a.tone])}>
                <a.Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[13px] font-semibold leading-tight text-text-primary">{a.label}</p>
                <p className="mt-0.5 text-[11px] text-text-muted">{a.sub}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ───── PAGE ───── */

export default function StudentHome() {
  const session = useRequireRole("learner");
  const profile = useStudentProfile(session?.externalRef);
  const runPathway = useRunPathway();

  // Auto-run the pathway analysis once per session so the dashboard has
  // fresh recognition/gap/bridge numbers without the student needing to
  // press a button first — mirrors what /student/pathways lets them
  // re-run on demand.
  useEffect(() => {
    if (session && !runPathway.data && !runPathway.isPending) {
      runPathway.mutate({
        studentId: session.externalRef,
        targetProgramme: session.targetProgramme ?? "BTech-CSE",
        institution: session.targetInstitution ?? "IIT Bombay",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  if (!session) return null;

  const firstName = session.displayName.split(" ")[0];
  const recognition = runPathway.data?.recognition;
  const totalCourses = recognition
    ? recognition.direct + recognition.bridge + recognition.missing + recognition.review + recognition.policy_conflict
    : 0;
  const alignment = totalCourses ? Math.round(((recognition!.direct + recognition!.bridge) / totalCourses) * 100) : 0;
  const semsRemaining = runPathway.data?.pathways.length
    ? Math.min(...runPathway.data.pathways.map((p) => p.terms))
    : 0;

  const topBarRight = (
    <>
      <span className="pill hidden lg:inline-flex">
        <span className="font-semibold text-text-primary">
          {session.externalRef}
        </span>
        <span className="text-text-muted">·</span>
        <span>{session.programme}</span>
      </span>
      <span className="pill hidden md:inline-flex">
        {session.targetInstitution}
      </span>
      <RecognizedBadge percent={alignment} />
    </>
  );

  return (
    <AppShell
      title="Student Dashboard"
      subtitle="Overview of your academic pathway"
      topBarRight={topBarRight}
      reserveBottom
    >
      <section className="mx-auto max-w-[1700px] space-y-5 px-4 pb-4 pt-4 md:px-6">
        <Hero firstName={firstName} />

        {runPathway.isPending && !runPathway.data ? (
          <div className="card-warm p-8 text-center text-[13px] text-text-secondary">
            Running your pathway analysis…
          </div>
        ) : recognition ? (
          <>
            <StatsRow
              recognized={recognition.direct + recognition.bridge}
              bridges={recognition.bridge}
              semsRemaining={semsRemaining}
              alignment={alignment}
            />
            <RecognitionBreakdown recognition={recognition} />
          </>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-2">
          <ContinueWhereYouLeftOff latest={profile.data?.decisions[0]} />
          <QuickActions />
        </div>
      </section>
      <BottomStrip
        label={"Audit Sync\nStatus"}
        statusTitle="HEI Board of Studies pre-approved bridge pathway"
        statusIcon={<CheckCircle2 className="h-4 w-4" />}
        ctaLabel="Proceed & Update Academic Plan"
        ctaHref="/student/plan/update"
      />
    </AppShell>
  );
}
