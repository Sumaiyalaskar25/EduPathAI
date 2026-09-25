"use client";

import { useEffect, useState } from "react";
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
  ShieldCheck,
  Building2,
  Layers,
  Award,
  ExternalLink,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { BottomStrip } from "@/components/layout/BottomStrip";
import { RecognizedBadge } from "@/components/pathways/RecognizedBadge";
import { cn } from "@/lib/utils/cn";
import { useRequireRole } from "@/lib/hooks/useRequireRole";
import { useRunPathway, useStudentProfile } from "@/lib/api/hooks";
import type { DecisionHistoryItem, RecognitionSummary } from "@/lib/api/types";
import { toRecognitionView } from "@/lib/transforms/recognition";
import { DecisionInspectorModal } from "@/components/student/DecisionInspectorModal";
import { CourseModal } from "@/components/student/CourseModal";
import { NetworkModal } from "@/components/auth/NetworkModal";

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

interface HeroProps {
  firstName: string;
  sourceInstitution?: string;
  targetInstitution?: string;
  programme?: string;
  apaarMasked?: string;
  onOpenNetwork: () => void;
}

function Hero({
  firstName,
  sourceInstitution = "VIT Vellore",
  targetInstitution = "IIT Kanpur",
  programme = "B.Tech Computer Science & Engineering",
  apaarMasked = "3390 **** 1187",
  onOpenNetwork,
}: HeroProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="glass-strong relative overflow-hidden rounded-3xl p-6 md:p-8 border border-white/80 shadow-[0_10px_35px_rgba(26,42,82,0.06)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 45% 70% at 8% 20%, rgb(16 185 129 / 0.12) 0%, transparent 60%), radial-gradient(ellipse 40% 65% at 92% 18%, rgb(26 42 82 / 0.10) 0%, transparent 55%)",
        }}
      />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 max-w-3xl">
          {/* Status Badges Row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-800 border border-emerald-200/80">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Academic Mobility · Live
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgb(26_42_82)]/5 px-3 py-1 text-[11px] font-semibold text-[rgb(26_42_82)] border border-[rgb(26_42_82)]/10">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              APAAR: {apaarMasked} · DigiLocker
            </span>
            <button
              type="button"
              onClick={onOpenNetwork}
              className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200/80"
            >
              <Building2 className="h-3.5 w-3.5" />
              129 National HEIs Indexed
            </button>
          </div>

          <h1 className="mt-3 font-display text-[32px] font-bold leading-tight tracking-tight text-[rgb(26_42_82)] md:text-[40px]">
            Welcome back, {firstName}.
          </h1>

          {/* Active Degree Route Visual */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px] text-text-secondary">
            <span className="font-semibold text-text-primary">{sourceInstitution}</span>
            <span className="flex items-center text-emerald-700">
              <ArrowRight className="h-3.5 w-3.5 mx-1" />
            </span>
            <span className="font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
              {targetInstitution}
            </span>
            <span className="text-text-muted">·</span>
            <span>{programme}</span>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
              NCrF Level 6.0
            </span>
          </div>

          <p className="mt-2.5 max-w-2xl text-[13.5px] leading-relaxed text-text-secondary">
            Your transfer evaluation is hash-chained to the national audit ledger.
            Review your recommended pathways and bridge modules before the next Board of Studies window.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex shrink-0 flex-wrap gap-3">
          <Link href="/student/pathways" className="pill-navy shadow-md shadow-[rgb(26_42_82)]/20 hover:shadow-lg">
            <Sparkles className="h-4 w-4 text-emerald-300" />
            <span>Review Pathway</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/student/tree"
            className="flex items-center gap-2 rounded-full border border-border-subtle bg-white/80 px-4 py-2.5 text-[13px] font-semibold text-text-primary transition-all hover:bg-white hover:border-emerald-300 hover:shadow-sm"
          >
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <span>Academic Tree</span>
          </Link>
          <Link
            href="/student/gaps"
            className="flex items-center gap-2 rounded-full border border-border-subtle bg-white/80 px-4 py-2.5 text-[13px] font-semibold text-text-primary transition-all hover:bg-white hover:border-amber-300 hover:shadow-sm"
          >
            <Target className="h-4 w-4 text-amber-600" />
            <span>View Gaps</span>
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
    {
      key: "recognized",
      label: "Credits Recognized",
      value: recognized,
      suffix: "",
      subtext: "Validated under NEP 2020",
      tone: "emerald",
      badge: "Direct Transfer",
      Icon: GraduationCap,
    },
    {
      key: "bridges",
      label: "Bridges Required",
      value: bridges,
      suffix: "",
      subtext: "8-Week FastTrack Eligible",
      tone: "amber",
      badge: "Skill Delta",
      Icon: GitBranch,
    },
    {
      key: "sems",
      label: "Semesters Left",
      value: semsRemaining,
      suffix: "",
      subtext: "Convocation on Target",
      tone: "navy",
      badge: "Optimized",
      Icon: CalendarRange,
    },
    {
      key: "alignment",
      label: "Content Alignment",
      value: alignment,
      suffix: "%",
      subtext: "Bloom L3-L5 Full Match",
      tone: "emerald",
      badge: "Syllabi Equated",
      Icon: Target,
    },
  ] as const;

  const toneMap = {
    emerald: "text-emerald-700 bg-emerald-50 border-emerald-200",
    amber: "text-amber-800 bg-amber-50 border-amber-200",
    navy: "text-[rgb(26_42_82)] bg-slate-100 border-slate-200",
  };

  const textToneMap = {
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
          className="card-warm relative overflow-hidden flex flex-col gap-2.5 p-5 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md transition-all hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-text-muted">
              {item.label}
            </span>
            <span className={cn("rounded-md px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide border", toneMap[item.tone])}>
              {item.badge}
            </span>
          </div>

          <div className="mt-1 flex items-baseline gap-1">
            <span
              className={cn(
                "font-display text-[36px] font-bold leading-none tracking-tight tabular-nums",
                textToneMap[item.tone]
              )}
            >
              {item.value}
            </span>
            <span className={cn("text-[14px] font-semibold", textToneMap[item.tone])}>
              {item.suffix}
            </span>
          </div>

          <div className="mt-1 flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-text-secondary">
            <span>{item.subtext}</span>
            <item.Icon className={cn("h-3.5 w-3.5 shrink-0 opacity-70", textToneMap[item.tone])} />
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

interface RecognitionBreakdownProps {
  recognition: RecognitionSummary;
  onSelectCourse: (courseCode: string) => void;
}

function RecognitionBreakdown({ recognition, onSelectCourse }: RecognitionBreakdownProps) {
  const items = [
    { name: "Direct", value: recognition.direct },
    { name: "Bridge", value: recognition.bridge },
    { name: "Missing", value: recognition.missing },
    { name: "Review", value: recognition.review },
    { name: "Policy Conflict", value: recognition.policy_conflict },
  ].filter((d) => d.value > 0);
  const total = items.reduce((s, d) => s + d.value, 0) || 1;

  // Sample mapped course pills for instant interactive inspection
  const samplePills = [
    { code: "BCA-101 ➔ CS-101", title: "Programming Principles & C Logic", type: "Bridge", status: "4-Week Bridge" },
    { code: "BCA-201 ➔ CS-201", title: "Data Structures & Asymptotics", type: "Direct", status: "Equivalence Granted" },
    { code: "BCA-301 ➔ CS-301", title: "Discrete Mathematical Structures", type: "Direct", status: "Equivalence Granted" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.5 }}
      className="card-warm p-6 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
              Recognition Breakdown
            </p>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
              NCrF Framework Aligned
            </span>
          </div>
          <h3 className="mt-1 font-display text-[18px] font-bold tracking-tight text-text-primary">
            {total} course{total === 1 ? "" : "s"} evaluated against target syllabus
          </h3>
        </div>
        <Link
          href="/student/audit"
          className="flex items-center gap-1 text-[12px] font-semibold text-emerald-700 hover:underline"
        >
          Full Ledger Proof
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Segmented Bar */}
      <div className="mt-5 flex h-3 w-full overflow-hidden rounded-full bg-slate-100 shadow-inner">
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

      {/* Stats summary row */}
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

      {/* Interactive Course Equivalence Chips */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
          Click any evaluated mapping to inspect learning outcome alignment:
        </p>
        <div className="mt-2.5 flex flex-wrap gap-2.5">
          {samplePills.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => onSelectCourse(c.code.split(" ➔ ")[1] || c.code)}
              className="group flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white/90 px-3.5 py-2 text-left transition-all hover:border-emerald-300 hover:bg-emerald-50/40 hover:shadow-sm"
            >
              <span className="flex h-2 w-2 rounded-full" style={{ backgroundColor: BREAKDOWN_COLORS[c.type] }} />
              <span className="font-mono text-[11.5px] font-bold text-text-primary group-hover:text-emerald-900">
                {c.code}
              </span>
              <span className="text-[11px] text-text-secondary">· {c.title}</span>
              <span className="ml-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[9.5px] font-medium text-slate-700">
                {c.status}
              </span>
            </button>
          ))}
        </div>
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

interface ContinueProps {
  latest: DecisionHistoryItem | undefined;
  onInspect: (item: DecisionHistoryItem) => void;
}

function ContinueWhereYouLeftOff({ latest, onInspect }: ContinueProps) {
  if (!latest) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.5 }}
        className="card-warm flex h-full flex-col items-center justify-center gap-3 p-6 text-center border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
      >
        <p className="text-[13px] text-text-secondary">
          No decisions yet — running fresh pathway analysis…
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
      className="card-warm flex h-full flex-col p-6 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
            Continue where you left off
          </p>
          <h3 className="mt-1 font-display text-[18px] font-bold tracking-tight text-text-primary">
            Latest Decision Bundle
          </h3>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-mono text-slate-700">
          SHA-256 Chained
        </span>
      </div>

      <div className="mt-5 flex-1">
        <div className="group flex h-full flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white/85 p-5 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md">
          <div className="flex items-start justify-between gap-3">
            <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-sm", chip)}>
              <Icon className="h-4 w-4" />
            </span>
            <div className="flex items-center gap-1.5">
              <span className={cn("rounded-full px-2.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider", chip)}>
                {latest.status}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9.5px] font-semibold text-slate-600">
                BoS Review Queue
              </span>
            </div>
          </div>

          <div>
            <p className="text-[15px] font-bold leading-snug tracking-tight text-text-primary">
              {latest.summary}
            </p>
            <p className="mt-1.5 font-mono text-[11px] text-text-muted">
              Leaf: {latest.decision_id.slice(0, 16)}… · {fmtDateTime(latest.decided_at)}
            </p>
            <p className="mt-1 text-[12px] text-text-secondary">
              Curriculum Delta: Theory verified; 4-week bridging module assigned for systems laboratory.
            </p>
          </div>

          <div className="mt-auto flex items-center justify-between border-t border-border-subtle/80 pt-3">
            <button
              type="button"
              onClick={() => onInspect(latest)}
              className="flex items-center gap-2 text-[12px] font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              <Play className="h-3.5 w-3.5 fill-emerald-700" />
              <span>Inspect Decision Proof</span>
            </button>
            <Link
              href={`/student/audit/${latest.decision_id}`}
              className="text-[11.5px] font-semibold text-slate-500 hover:text-text-primary flex items-center gap-1"
            >
              <span>Audit view</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      <Link
        href="/student/audit"
        className="mt-4 flex items-center justify-between gap-2 rounded-2xl border border-border-subtle bg-canvas/60 px-4 py-3 text-[12px] font-semibold text-text-secondary transition-colors hover:bg-white hover:text-text-primary"
      >
        <span>View full immutable decision history</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </motion.div>
  );
}

/* ───── 5. QUICK ACTIONS ───── */

const QUICK_ACTIONS = [
  {
    href: "/student/tree",
    label: "Academic Tree",
    sub: "15,600+ National Courses Graph",
    badge: "12 Competencies",
    Icon: TrendingUp,
    tone: "emerald",
  },
  {
    href: "/student/pathways",
    label: "Pathways",
    sub: "2 Solved Degree Routes",
    badge: "FastTrack / Balanced",
    Icon: GitBranch,
    tone: "navy",
  },
  {
    href: "/student/gaps",
    label: "Gap Analysis",
    sub: "2 Bridge Modules Identified",
    badge: "Bloom Taxon Mapped",
    Icon: Target,
    tone: "amber",
  },
  {
    href: "/student/profile",
    label: "Profile & Sovereign Consents",
    sub: "DPDP Act (2023) Compliant",
    badge: "Zero-PII Active",
    Icon: GraduationCap,
    tone: "navy",
  },
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
      className="card-warm flex h-full flex-col p-6 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
    >
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
          Quick Actions
        </p>
        <h3 className="mt-1 font-display text-[18px] font-bold tracking-tight text-text-primary">
          Jump to Navigation
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
              className="group flex h-full flex-col gap-2 rounded-2xl border border-slate-200/80 bg-white/80 p-4 transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", tones[a.tone])}>
                  <a.Icon className="h-4 w-4" />
                </span>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-600">
                  {a.badge}
                </span>
              </div>
              <div className="mt-1">
                <p className="text-[13px] font-bold leading-tight text-text-primary group-hover:text-emerald-800 transition-colors">
                  {a.label}
                </p>
                <p className="mt-1 text-[11px] text-text-muted leading-tight">{a.sub}</p>
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

  // Dialog State
  const [networkModalOpen, setNetworkModalOpen] = useState(false);
  const [inspectedDecision, setInspectedDecision] = useState<DecisionHistoryItem | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<{
    code: string;
    title?: string;
    institution?: string;
    credits?: number;
    bloomLevel?: string;
    outcomes?: string[];
  } | null>(null);

  // Auto-run pathway analysis
  useEffect(() => {
    if (session && !runPathway.data && !runPathway.isPending) {
      runPathway.mutate({
        studentId: session.externalRef,
        targetProgramme: session.targetProgramme ?? "BTech-CSE",
        institution: session.targetInstitution ?? "IIT Kanpur",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  if (!session) return null;

  const firstName = session.displayName.split(" ")[0];
  const recognition = runPathway.data?.recognition;
  const alignment = toRecognitionView(recognition).recognizedPercent;
  const semsRemaining = runPathway.data?.pathways.length
    ? Math.min(...runPathway.data.pathways.map((p) => p.terms))
    : 0;

  // Real or synthesized decision from profile
  const latestDecision = profile.data?.decisions[0] || (runPathway.data ? {
    decision_id: runPathway.data.decision_id,
    summary: "BCA-101 -> CS-101 (BRIDGE)",
    status: "PENDING",
    decided_at: new Date().toISOString(),
    auditor: "Board of Studies (IIT Kanpur)",
  } : undefined);

  const topBarRight = (
    <>
      <span className="pill hidden lg:inline-flex">
        <span className="font-semibold text-text-primary">
          {session.externalRef}
        </span>
        <span className="text-text-muted">·</span>
        <span>{session.programme}</span>
      </span>
      <span className="pill hidden md:inline-flex font-medium text-emerald-800 bg-emerald-50/80 border border-emerald-200">
        Target: {session.targetInstitution ?? "IIT Kanpur"}
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
        <Hero
          firstName={firstName}
          sourceInstitution={session.institution ?? "VIT Vellore"}
          targetInstitution={session.targetInstitution ?? "IIT Kanpur"}
          programme={session.programme ?? "B.Tech Computer Science & Engineering"}
          apaarMasked="3390 **** 1187"
          onOpenNetwork={() => setNetworkModalOpen(true)}
        />

        {runPathway.isPending && !runPathway.data ? (
          <div className="card-warm flex items-center justify-center gap-3 p-8 text-center text-[13px] text-text-secondary border border-white/80">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
            </span>
            <span>Running neural pathway reconciliation against IIT Kanpur curriculum…</span>
          </div>
        ) : recognition ? (
          <>
            <StatsRow
              recognized={recognition.direct + recognition.bridge}
              bridges={recognition.bridge}
              semsRemaining={semsRemaining}
              alignment={alignment}
            />
            <RecognitionBreakdown
              recognition={recognition}
              onSelectCourse={(code) =>
                setSelectedCourse({
                  code,
                  institution: session.targetInstitution ?? "IIT Bombay",
                })
              }
            />
          </>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-2">
          <ContinueWhereYouLeftOff
            latest={latestDecision}
            onInspect={(item) => setInspectedDecision(item)}
          />
          <QuickActions />
        </div>
      </section>

      {/* Decision Inspector Dialog */}
      <DecisionInspectorModal
        open={!!inspectedDecision}
        onOpenChange={(open) => !open && setInspectedDecision(null)}
        decision={inspectedDecision}
        studentRef={session.externalRef}
      />

      {/* Course Detail Dialog */}
      <CourseModal
        open={!!selectedCourse}
        onOpenChange={(open) => !open && setSelectedCourse(null)}
        course={selectedCourse}
      />

      {/* National Network Modal */}
      <NetworkModal
        open={networkModalOpen}
        onOpenChange={setNetworkModalOpen}
      />

      <BottomStrip
        label={"Audit Sync\nStatus"}
        statusTitle="HEI Board of Studies pre-approved bridge pathway"
        statusIcon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
        ctaLabel="Proceed & Update Academic Plan"
        ctaHref="/student/plan/update"
      />
    </AppShell>
  );
}
