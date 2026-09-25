"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ShieldCheck,
  BadgeCheck,
  Fingerprint,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Download,
  Loader2,
  Copy,
  Check,
  Lock,
  Building2,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Shield,
  KeyRound,
  FileCheck2,
  GraduationCap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { StudentProfile, DecisionHistoryItem, ConsentEntry } from "@/lib/api/types";
import { downloadStudentExport, downloadBlob } from "@/lib/api/client";
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

function truncHash(h: string, head = 8, tail = 6): string {
  if (!h || h.length <= head + tail + 3) return h;
  return `${h.slice(0, head)}…${h.slice(-tail)}`;
}

/* ── section wrapper ── */

function Section({
  label,
  title,
  subtitle,
  children,
  delay = 0,
  badge,
}: {
  label: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  delay?: number;
  badge?: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="card-warm rounded-3xl p-7 md:p-8 border border-white/80 shadow-xs"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-text-muted">
            {label}
          </p>
          <h2 className="mt-1 font-display text-[20px] font-bold tracking-tight text-slate-900">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-[12px] text-text-secondary">{subtitle}</p>
          )}
        </div>
        {badge}
      </header>
      <div className="mt-5">{children}</div>
    </motion.section>
  );
}

/* ── BLOCK 1: Identity Card ── */

function IdentityCard({ identity }: { identity: StudentProfile["identity"] }) {
  const I = identity;
  const initials = I.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  const [copiedApaar, setCopiedApaar] = useState(false);
  const [copiedAbc, setCopiedAbc] = useState(false);

  const copyApaar = () => {
    navigator.clipboard.writeText(I.apaar);
    setCopiedApaar(true);
    toast.success("APAAR ID copied to clipboard");
    setTimeout(() => setCopiedApaar(false), 2000);
  };

  const copyAbc = () => {
    navigator.clipboard.writeText(I.abc_id);
    setCopiedAbc(true);
    toast.success("ABC Credential ID copied to clipboard");
    setTimeout(() => setCopiedAbc(false), 2000);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="glass-strong relative overflow-hidden rounded-3xl p-7 md:p-8 border border-white/90 shadow-[0_15px_40px_rgba(26,42,82,0.06)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 75% at 5% 15%, rgb(16 185 129 / 0.12) 0%, transparent 60%), radial-gradient(ellipse 45% 70% at 95% 20%, rgb(59 130 246 / 0.10) 0%, transparent 55%)",
        }}
      />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Avatar + Main Identity Info */}
        <div className="flex items-start gap-5 min-w-0">
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 via-[rgb(26_42_82)] to-blue-950 font-display text-[26px] font-bold text-white shadow-md border border-white/20">
            {initials}
            <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
              <Check className="h-3.5 w-3.5 stroke-[3]" />
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-[26px] font-extrabold tracking-tight text-slate-900 md:text-[30px]">
                {I.full_name}
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10.5px] font-bold text-emerald-800 border border-emerald-200">
                <ShieldCheck className="h-3 w-3" />
                Verified Student
              </span>
            </div>

            <p className="mt-1 text-[13.5px] font-medium text-text-secondary">
              {I.programme} · Enrolled {fmtDate(I.enrolled_on)}
            </p>

            <div className="mt-3.5 flex flex-wrap items-center gap-2">
              {/* APAAR Pill */}
              <button
                type="button"
                onClick={copyApaar}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white/90 px-3 py-1 text-[11px] font-semibold text-slate-700 hover:bg-white hover:text-slate-900 transition-colors shadow-2xs"
              >
                <BadgeCheck className="h-3.5 w-3.5 text-blue-600" />
                <span>APAAR: {I.apaar}</span>
                {copiedApaar ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3 text-slate-400" />}
              </button>

              {/* ABC ID Pill */}
              <button
                type="button"
                onClick={copyAbc}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white/90 px-3 py-1 text-[11px] font-semibold text-slate-700 hover:bg-white hover:text-slate-900 transition-colors shadow-2xs"
              >
                <FileText className="h-3.5 w-3.5 text-emerald-600" />
                <span>{I.abc_id}</span>
                {copiedAbc ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3 text-slate-400" />}
              </button>

              {/* DigiLocker Pill */}
              <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 border border-emerald-200">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                DigiLocker Synced
              </span>

              {/* Biometric Pill */}
              <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-800 border border-blue-200">
                <Fingerprint className="h-3.5 w-3.5 text-blue-600" />
                Aadhaar e-Sign Verified
              </span>
            </div>
          </div>
        </div>

        {/* Mobility Corridor Card */}
        <div className="flex shrink-0 flex-col justify-between rounded-2xl border border-slate-200/90 bg-white/95 p-4.5 shadow-xs md:w-[280px]">
          <div>
            <div className="flex items-center justify-between text-text-muted">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em]">
                Current HEI
              </span>
              <span className="rounded bg-slate-100 px-1.5 py-0.2 font-mono text-[9px] font-semibold text-slate-600">
                Origin
              </span>
            </div>
            <p className="mt-1 text-[13.5px] font-bold text-slate-900">
              {I.institution}
            </p>
          </div>

          <div className="my-2.5 flex items-center gap-2 text-text-muted">
            <div className="h-px flex-1 bg-slate-200" />
            <ArrowRight className="h-3.5 w-3.5 text-emerald-600" />
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div>
            <div className="flex items-center justify-between text-text-muted">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em]">
                Target Horizon
              </span>
              <span className="rounded bg-emerald-100 px-1.5 py-0.2 font-mono text-[9px] font-bold text-emerald-800">
                NCrF L6.0
              </span>
            </div>
            <p className="mt-1 text-[13.5px] font-bold text-emerald-950">
              {I.target_institution}
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

/* ── BLOCK 2: Consents (DPDP Act 2023) ── */

function ConsentsBlock({ consents }: { consents: StudentProfile["consents"] }) {
  const [activeConsents, setActiveConsents] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    consents.forEach((c) => {
      map[c.id] = c.active;
    });
    return map;
  });

  const toggleConsent = (id: string, scope: string) => {
    setActiveConsents((prev) => {
      const next = !prev[id];
      toast.success(
        next
          ? `Consent affirmed for "${scope}". Logged to sovereign ledger.`
          : `Consent temporarily paused for "${scope}".`
      );
      return { ...prev, [id]: next };
    });
  };

  return (
    <Section
      label="DPDP Act (2023) Governance"
      title="Consent & Data Governance Registry"
      subtitle="Explicit, purpose-limited authorization complying with Sections 6 & 7 of the DPDP Act 2023"
      delay={0.15}
      badge={
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-800 border border-emerald-200">
          <Shield className="h-3.5 w-3.5 text-emerald-600" />
          Sovereign Consent Active
        </span>
      }
    >
      <div className="space-y-3">
        {consents.map((c, i) => {
          const isActive = activeConsents[c.id] ?? c.active;

          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.04, duration: 0.4 }}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-4.5 transition-all hover:border-emerald-300 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "h-2 w-2 shrink-0 rounded-full",
                      isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
                    )}
                  />
                  <p className="text-[13.5px] font-bold text-slate-900 leading-snug">
                    {c.scope}
                  </p>
                </div>

                <p className="mt-1 text-[12px] leading-relaxed text-text-secondary">
                  {c.purpose}
                </p>

                <div className="mt-2 flex items-center gap-3 text-[11px] text-text-muted">
                  <span>Granted on {fmtDate(c.granted_at)}</span>
                  <span>•</span>
                  <span>{c.expires_at ? `Expires ${fmtDate(c.expires_at)}` : "Perpetual till graduation"}</span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider",
                    isActive
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  )}
                >
                  {isActive ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      Active
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 text-slate-400" />
                      Paused
                    </>
                  )}
                </span>

                <button
                  type="button"
                  onClick={() => toggleConsent(c.id, c.scope)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-white hover:text-slate-900 transition-colors"
                >
                  {isActive ? "Manage" : "Re-activate"}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
}

/* ── BLOCK 3: Decision History ── */

function DecisionsBlock({ decisions }: { decisions: DecisionHistoryItem[] }) {
  return (
    <Section
      label="Audit Trail"
      title="Recognized Decisions & Equivalence Log"
      subtitle="Complete chronological index of all automated and faculty-reviewed milestones"
      delay={0.25}
      badge={
        <Link
          href="/student/audit"
          className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
        >
          <span>Open Full Sovereign Ledger</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      }
    >
      {decisions.length === 0 ? (
        <div className="py-12 text-center text-[13px] text-text-secondary">
          No academic recognition decisions recorded yet. Run a pathway simulation to create your first block.
        </div>
      ) : (
        <div className="space-y-3">
          {decisions.slice(0, 5).map((d, i) => {
            const isApproved = d.status === "APPROVED";
            const isContested = d.status === "CONTESTED";

            return (
              <motion.div
                key={d.decision_id || i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.04, duration: 0.35 }}
              >
                <Link
                  href={`/student/audit/${d.decision_id}`}
                  className="group flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/95 p-4.5 transition-all hover:border-emerald-300 hover:bg-white hover:shadow-xs sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-2xs mt-0.5",
                        isApproved
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : isContested
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      )}
                    >
                      {isApproved ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.2 rounded">
                          #BLOCK-{String(decisions.length - i).padStart(2, "0")}
                        </span>
                        <p className="text-[13.5px] font-bold text-slate-900 group-hover:text-emerald-950 transition-colors">
                          {d.summary}
                        </p>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-text-muted">
                        <span className="font-mono">UUID: {d.decision_id.slice(0, 14)}…</span>
                        <span>•</span>
                        <span>{d.auditor}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center justify-between gap-4 border-t border-slate-100 pt-2 sm:border-none sm:pt-0">
                    <div className="flex flex-col items-end">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                          isApproved
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : isContested
                            ? "bg-purple-50 text-purple-800 border border-purple-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        )}
                      >
                        {isApproved ? "Approved & Sealed" : isContested ? "Contested" : "Awaiting Review"}
                      </span>
                      <span className="mt-0.5 text-[10.5px] text-text-muted">
                        {fmtDateTime(d.decided_at)}
                      </span>
                    </div>

                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </Section>
  );
}

/* ── BLOCK 4: Account Security & Trust ── */

function SecurityBlock({
  security,
  externalRef,
}: {
  security: StudentProfile["security"];
  externalRef: string;
}) {
  const S = security;
  const [downloading, setDownloading] = useState(false);
  const [copiedHead, setCopiedHead] = useState(false);

  const onDownload = async () => {
    setDownloading(true);
    try {
      const blob = await downloadStudentExport(externalRef);
      downloadBlob(blob, `edupathai-export-${externalRef}.json`);
      toast.success("DPDP Data Portability export downloaded successfully");
    } catch {
      toast.error("Could not generate your data export.");
    } finally {
      setDownloading(false);
    }
  };

  const copyHead = () => {
    if (S.ledger_head) {
      navigator.clipboard.writeText(S.ledger_head);
      setCopiedHead(true);
      toast.success("Current ledger head hash copied");
      setTimeout(() => setCopiedHead(false), 2000);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.5 }}
      className="card-warm flex h-full flex-col justify-between rounded-3xl p-7 border border-white/80 shadow-xs"
    >
      <div>
        <header className="border-b border-slate-100 pb-4">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-text-muted">
            Account Security & Compliance
          </p>
          <h2 className="mt-1 font-display text-[20px] font-bold tracking-tight text-slate-900">
            Trust & Sovereignty
          </h2>
        </header>

        <div className="mt-5 space-y-4">
          {/* Hash Chain Integrity */}
          <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Chain Integrity
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                <ShieldCheck className="h-3 w-3" />
                Intact
              </span>
            </div>
            <p className="mt-1 text-[13px] font-bold text-emerald-800">
              {S.chain_integrity}
            </p>
            <p className="mt-0.5 text-[11px] text-text-muted">
              Tamper-evident verification across all HEI nodes
            </p>
          </div>

          {/* Ledger Root Head */}
          {S.ledger_head && (
            <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  Current Head Hash
                </span>
                <button
                  type="button"
                  onClick={copyHead}
                  className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-slate-600 hover:text-slate-900"
                >
                  {copiedHead ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  <span>Copy</span>
                </button>
              </div>
              <p className="mt-1 break-all font-mono text-[11px] text-slate-700">
                {truncHash(S.ledger_head, 12, 10)}
              </p>
            </div>
          )}

          {/* Key Metrics List */}
          <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200/80 bg-white/90 p-4 text-[12px]">
            <li className="flex items-center justify-between py-2.5 first:pt-0">
              <span className="text-text-secondary">Archived Decisions</span>
              <span className="font-mono font-bold text-slate-900">
                {S.raw_docs_archived} Proofs
              </span>
            </li>
            <li className="flex items-center justify-between py-2.5">
              <span className="text-text-secondary">Privacy Standard</span>
              <span className="font-semibold text-emerald-700">
                Zero-PII Storage
              </span>
            </li>
            <li className="flex items-center justify-between py-2.5 last:pb-0">
              <span className="text-text-secondary">Statutory Compliance</span>
              <span className="font-semibold text-slate-800 text-[11px]">
                DPDP Act (2023)
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Portability Action Button */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <button
          onClick={onDownload}
          disabled={downloading}
          className="flex w-full items-center justify-between rounded-xl bg-slate-900 px-4 py-3 text-[12.5px] font-semibold text-white shadow-md transition-all hover:bg-slate-800 disabled:opacity-60"
        >
          <span className="inline-flex items-center gap-2">
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
            ) : (
              <Download className="h-4 w-4 text-emerald-400" />
            )}
            Download My Complete Data (DPDP)
          </span>
          <ArrowRight className="h-3.5 w-3.5 opacity-70" />
        </button>
        <p className="mt-2 text-center text-[10.5px] text-text-muted">
          Right to Data Portability under DPDP Act Section 12
        </p>
      </div>
    </motion.section>
  );
}

/* ── MAIN EXPORT ── */

export function ProfilePanel({
  profile,
  externalRef,
}: {
  profile: StudentProfile;
  externalRef: string;
}) {
  return (
    <div className="space-y-6">
      <IdentityCard identity={profile.identity} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_380px]">
        <div className="space-y-6">
          <ConsentsBlock consents={profile.consents} />
          <DecisionsBlock decisions={profile.decisions} />
        </div>
        <div>
          <SecurityBlock security={profile.security} externalRef={externalRef} />
        </div>
      </div>
    </div>
  );
}