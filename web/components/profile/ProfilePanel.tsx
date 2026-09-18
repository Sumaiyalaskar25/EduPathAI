"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck,
  BadgeCheck,
  Fingerprint,
  Calendar,
  MapPin,
  Lock,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Download,
} from "lucide-react";
import {
  DEMO_IDENTITY,
  DEMO_CONSENTS,
  DEMO_DECISIONS,
  DEMO_SECURITY,
  type DecisionRecord,
} from "@/lib/constants/demo-profile";
import { cn } from "@/lib/utils/cn";

/* ── helpers ── */

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

/* ── section wrapper ── */

function Section({
  label,
  title,
  children,
  delay = 0,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="card-warm rounded-3xl p-8"
    >
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
          {label}
        </p>
        <h2 className="mt-1.5 font-display text-[22px] font-bold tracking-tight text-text-primary">
          {title}
        </h2>
      </header>
      <div className="mt-6">{children}</div>
    </motion.section>
  );
}

/* ── BLOCK 1: Identity card ── */

function IdentityCard() {
  const I = DEMO_IDENTITY;
  const initials = I.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="glass-strong relative overflow-hidden rounded-3xl p-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 80% at 8% 20%, rgb(16 185 129 / 0.10) 0%, transparent 60%), radial-gradient(ellipse 40% 70% at 92% 15%, rgb(26 42 82 / 0.08) 0%, transparent 55%)",
        }}
      />

      <div className="relative flex flex-col gap-8 md:flex-row md:items-center">
        {/* Avatar */}
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[rgb(26_42_82)] to-[rgb(14_22_48)] font-display text-[28px] font-bold text-white shadow-lg">
          {initials}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-[28px] font-bold leading-none tracking-tight text-text-primary">
            {I.fullName}
          </h1>
          <p className="mt-2 text-[13.5px] font-medium text-text-secondary">
            {I.programme}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="pill">
              <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />
              APAAR: {I.apaar}
            </span>
            <span className="pill">
              <FileText className="h-3.5 w-3.5" />
              {I.abcId}
            </span>
            {I.digilockerLinked && (
              <span className="pill">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                DigiLocker linked
              </span>
            )}
            {I.biometricVerified && (
              <span className="pill">
                <Fingerprint className="h-3.5 w-3.5 text-emerald-600" />
                Aadhaar e-Sign verified
              </span>
            )}
          </div>
        </div>

        {/* Institution trail */}
        <div className="flex shrink-0 flex-col gap-3 rounded-2xl border border-border-subtle bg-white/70 p-5 md:w-[240px]">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted">
              Currently at
            </p>
            <p className="mt-1 text-[13px] font-semibold text-text-primary">
              {I.institution}
            </p>
          </div>
          <div className="h-px w-full bg-border-subtle/70" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted">
              Targeting
            </p>
            <p className="mt-1 text-[13px] font-semibold text-text-primary">
              {I.targetInstitution}
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

/* ── BLOCK 2: Consents ── */

function ConsentsBlock() {
  return (
    <Section label="DPDP Act 2023" title="Consent Log" delay={0.15}>
      <ul className="space-y-3">
        {DEMO_CONSENTS.map((c, i) => (
          <motion.li
            key={c.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + i * 0.05, duration: 0.4 }}
            className="grid grid-cols-[1fr_auto] items-start gap-4 rounded-2xl border border-border-subtle bg-white/70 p-5 transition-all hover:border-emerald-200 hover:shadow-sm"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "h-2 w-2 shrink-0 rounded-full",
                    c.active ? "bg-emerald-500" : "bg-slate-300"
                  )}
                />
                <p className="truncate text-[13.5px] font-semibold text-text-primary">
                  {c.scope}
                </p>
              </div>
              <p className="mt-1.5 text-[12px] leading-snug text-text-secondary">
                {c.purpose}
              </p>
              <div className="mt-2 flex items-center gap-3 text-[11px] font-medium text-text-muted">
                <span>Granted {fmtDate(c.grantedAt)}</span>
                <span className="text-border-strong">·</span>
                <span>Expires {fmtDate(c.expiresAt)}</span>
              </div>
            </div>

            {c.active ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-emerald-800">
                <CheckCircle2 className="h-3 w-3" />
                Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-slate-700">
                <XCircle className="h-3 w-3" />
                Revoked
              </span>
            )}
          </motion.li>
        ))}
      </ul>
    </Section>
  );
}

/* ── BLOCK 3: Decisions ── */

const STATUS_STYLE: Record<
  DecisionRecord["status"],
  { bg: string; fg: string; icon: typeof Clock }
> = {
  APPROVED: { bg: "bg-emerald-100", fg: "text-emerald-800", icon: CheckCircle2 },
  PENDING: { bg: "bg-amber-100", fg: "text-amber-900", icon: Clock },
  REVIEW: { bg: "bg-rose-100", fg: "text-rose-800", icon: XCircle },
};

function DecisionsBlock() {
  return (
    <Section label="Audit Trail" title="Decision History" delay={0.25}>
      <ul className="space-y-3">
        {DEMO_DECISIONS.map((d, i) => {
          const s = STATUS_STYLE[d.status];
          const Icon = s.icon;
          return (
            <motion.li
              key={d.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.05, duration: 0.4 }}
              className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl border border-border-subtle bg-white/70 p-5 transition-all hover:border-emerald-200 hover:shadow-sm"
            >
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                  s.bg
                )}
              >
                <Icon className={cn("h-4 w-4", s.fg)} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-semibold text-text-primary">
                  {d.summary}
                </p>
                <div className="mt-1 flex items-center gap-3 text-[11px] font-medium text-text-muted">
                  <span className="font-mono">{d.decisionId}</span>
                  <span className="text-border-strong">·</span>
                  <span>{d.auditor}</span>
                </div>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-1">
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider",
                    s.bg,
                    s.fg
                  )}
                >
                  {d.status}
                </span>
                <span className="font-mono text-[10.5px] text-text-muted">
                  {fmtDateTime(d.decidedAt)}
                </span>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </Section>
  );
}

/* ── BLOCK 4: Security ── */

function SecurityBlock() {
  const S = DEMO_SECURITY;
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.5 }}
      className="card-warm flex h-full flex-col rounded-3xl p-8"
    >
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
          Account Security
        </p>
        <h2 className="mt-1.5 font-display text-[22px] font-bold tracking-tight text-text-primary">
          Trust &amp; privacy
        </h2>
      </header>

      <ul className="mt-6 flex-1 space-y-4">
        <Row
          icon={Lock}
          label="MFA enabled"
          value={S.mfaEnabled ? "Yes" : "No"}
          tone={S.mfaEnabled ? "good" : "warn"}
        />
        <Row
          icon={ShieldCheck}
          label="Hash chain"
          value={S.chainIntegrity}
          tone="good"
        />
        <Row
          icon={Clock}
          label="Last sign-in"
          value={fmtDateTime(S.lastSignIn)}
        />
        <Row
          icon={MapPin}
          label="Location"
          value={S.lastSignInLocation}
        />
        <Row
          icon={Calendar}
          label="Active sessions"
          value={String(S.sessionCount)}
        />
        <Row
          icon={FileText}
          label="Archived raw docs"
          value={`${S.rawDocsArchived} files`}
        />
      </ul>

      <button className="mt-6 flex w-full items-center justify-between gap-2 rounded-full border border-border-subtle bg-white px-5 py-3.5 text-[13px] font-semibold text-text-primary transition-colors hover:bg-canvas">
        <span className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download my data (DPDP)
        </span>
        <span className="text-text-muted">→</span>
      </button>
    </motion.section>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Lock;
  label: string;
  value: string;
  tone?: "good" | "warn";
}) {
  return (
    <li className="flex items-center gap-3 border-b border-border-subtle/50 pb-3 last:border-0 last:pb-0">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-canvas">
        <Icon className="h-3.5 w-3.5 text-text-secondary" />
      </span>
      <span className="flex-1 text-[12.5px] font-medium text-text-secondary">
        {label}
      </span>
      <span
        className={cn(
          "font-mono text-[12px] font-semibold tabular-nums",
          tone === "good" && "text-emerald-700",
          tone === "warn" && "text-amber-700",
          !tone && "text-text-primary"
        )}
      >
        {value}
      </span>
    </li>
  );
}

/* ── MAIN ── */

export function ProfilePanel() {
  return (
    <div className="space-y-5">
      <IdentityCard />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <ConsentsBlock />
          <DecisionsBlock />
        </div>
        <div>
          <SecurityBlock />
        </div>
      </div>
    </div>
  );
}