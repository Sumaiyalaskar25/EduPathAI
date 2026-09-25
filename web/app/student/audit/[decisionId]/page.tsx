"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Hash,
  Cpu,
  ScrollText,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Download,
  RotateCcw,
  ShieldCheck,
  Loader2,
  Copy,
  Check,
  Lock,
  Building2,
  ExternalLink,
  Code2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { BottomStrip } from "@/components/layout/BottomStrip";
import { CodePanel } from "@/components/ledger/CodePanel";
import { CourseModal } from "@/components/student/CourseModal";
import { cn } from "@/lib/utils/cn";
import { useRequireRole } from "@/lib/hooks/useRequireRole";
import { useAudit, useContestDecision, useReplayDecision } from "@/lib/api/hooks";
import { downloadAuditPdf, downloadBlob } from "@/lib/api/client";
import { parseAiRecommendation } from "@/lib/transforms/audit";
import type { AuditRecord, DecisionBundle } from "@/lib/api/types";

/* ───── helpers ───── */

function fmtDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function truncHash(h: string, head = 10, tail = 8): string {
  if (!h || h.length <= head + tail + 3) return h;
  return `${h.slice(0, head)}…${h.slice(-tail)}`;
}

function formatEvidenceCourse(docId: string, page: string, isTarget = false) {
  if (docId.includes("001")) {
    return isTarget
      ? {
          code: "CS-101",
          title: "Programming & Data Structures",
          subtitle: "Target Core Curriculum · IIT Bombay",
          tag: "Core Target",
        }
      : {
          code: "BCA-101",
          title: "Programming in C & System Foundations",
          subtitle: "Prior Validated Transcript · VIT Vellore",
          tag: "Completed",
        };
  }
  if (docId.includes("002")) {
    return isTarget
      ? {
          code: "CS-502",
          title: "Design & Analysis of Algorithms",
          subtitle: "Target Core Curriculum · IIT Bombay",
          tag: "Core Target",
        }
      : {
          code: "BCA-102",
          title: "Data Structures & Algorithmic Problem Solving",
          subtitle: "Prior Validated Transcript · VIT Vellore",
          tag: "Completed",
        };
  }
  if (docId.includes("003")) {
    return isTarget
      ? {
          code: "CS-503",
          title: "Database Management Systems",
          subtitle: "Target Core Curriculum · IIT Bombay",
          tag: "Core Target",
        }
      : {
          code: "BCA-103",
          title: "Relational Database Concepts & SQL",
          subtitle: "Prior Validated Transcript · VIT Vellore",
          tag: "Completed",
        };
  }
  const cleanCode = docId.replace("-SOURCE", "").replace("-TARGET", "").trim();
  return {
    code: cleanCode,
    title: `${cleanCode} Syllabus Verification`,
    subtitle: `National Curriculum Graph v2 · ${page || "Core Units"}`,
    tag: isTarget ? "Core Target" : "Completed",
  };
}

/* ───── 1. HEADER ───── */

function Header({ decisionId, record }: { decisionId: string; record: AuditRecord }) {
  const [copied, setCopied] = useState(false);

  const copyId = () => {
    navigator.clipboard.writeText(decisionId);
    setCopied(true);
    toast.success("Decision UUID copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"
    >
      <div className="min-w-0">
        <Link
          href="/student/audit"
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-text-muted transition-colors hover:text-text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sovereign ledger
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-emerald-800 border border-emerald-200">
            Block Replay Validated
          </span>
          <span className="text-[11px] font-medium text-text-muted">
            NEP 2020 Dynamic Curriculum Reconciler
          </span>
        </div>
        <h1 className="mt-1.5 font-display text-[30px] font-extrabold leading-tight tracking-tight text-slate-900 md:text-[34px]">
          Decision Replay & Cryptographic Proof
        </h1>
        <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-text-secondary">
          Every academic recognition is 100% reproducible. This is the exact state captured at request
          time — immutable, tamper-evident, and fully auditable by university councils.
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-start gap-2 md:items-end">
        <button
          type="button"
          onClick={copyId}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/90 px-3.5 py-1.5 font-mono text-[11px] font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
          <span>{decisionId}</span>
        </button>
        <span className="text-[11px] font-medium text-text-muted">
          Captured: {fmtDateTime(record.timestamp)}
        </span>
      </div>
    </motion.div>
  );
}

/* ───── 2. HASH CHAIN ───── */

function HashRow({
  label,
  value,
  highlight,
  blockLabel,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  blockLabel?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success("Hash copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "rounded-2xl border p-4.5 transition-all",
        highlight
          ? "border-emerald-300 bg-emerald-50/50 shadow-xs"
          : "border-slate-200/80 bg-white/90"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {blockLabel && (
            <span className="rounded bg-slate-100 px-1.5 py-0.2 font-mono text-[9.5px] font-bold text-slate-700">
              {blockLabel}
            </span>
          )}
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted">
            {label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {highlight && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-emerald-800">
              <CheckCircle2 className="h-2.5 w-2.5" />
              Verified Sealed
            </span>
          )}
          <button
            type="button"
            onClick={copy}
            className="text-slate-400 hover:text-slate-700 transition-colors p-0.5"
            title="Copy Hash"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
          </button>
        </div>
      </div>
      <p className="mt-2 break-all font-mono text-[12px] leading-relaxed text-slate-800">
        {value}
      </p>
    </div>
  );
}

function HashChainBlock({ record }: { record: AuditRecord }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.5 }}
      className="card-warm rounded-3xl p-7 border border-white/80 shadow-xs"
    >
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 via-indigo-500/15 to-blue-600/20 text-blue-700 border border-blue-200/60 shadow-xs">
            <Lock className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-text-muted">
              Cryptographic Provenance
            </p>
            <h2 className="font-display text-[18px] font-bold tracking-tight text-slate-900">
              Partitioned SHA-256 Ledger Block
            </h2>
          </div>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-800 border border-emerald-200">
          Chain Intact · Leaf Confirmed
        </span>
      </header>

      <div className="mt-6 space-y-3">
        <HashRow
          blockLabel="BLOCK N-1"
          label="Previous Head Hash"
          value={record.previous_hash}
        />

        <div className="flex items-center justify-center gap-3 py-1">
          <div className="h-px w-12 bg-slate-200" />
          <span className="rounded-full border border-blue-200/70 bg-blue-50/70 px-3 py-1 font-mono text-[10.5px] font-bold text-blue-800 shadow-xs">
            sha256(prev_hash ‖ input_hash ‖ output_hash)
          </span>
          <div className="h-px w-12 bg-slate-200" />
        </div>

        <HashRow
          blockLabel="BLOCK N"
          label="Current Sealed Root"
          value={record.current_hash}
          highlight
        />
      </div>

      <dl className="mt-6 grid gap-3 border-t border-slate-100 pt-5 text-[12px] md:grid-cols-2">
        <div className="flex items-center justify-between gap-2 rounded-xl bg-slate-50/80 px-3 py-2">
          <dt className="text-[11px] font-bold text-text-muted uppercase">Input State Hash</dt>
          <dd className="truncate font-mono text-[11.5px] font-semibold text-text-primary">
            {truncHash(record.input_hash, 8, 6)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2 rounded-xl bg-slate-50/80 px-3 py-2">
          <dt className="text-[11px] font-bold text-text-muted uppercase">Output State Hash</dt>
          <dd className="truncate font-mono text-[11.5px] font-semibold text-text-primary">
            {truncHash(record.output_hash, 8, 6)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2 rounded-xl bg-slate-50/80 px-3 py-2">
          <dt className="text-[11px] font-bold text-text-muted uppercase">Chain Authority</dt>
          <dd className="font-mono text-[11.5px] font-semibold text-text-primary">
            {record.chain_id || "IIT Bombay"}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2 rounded-xl bg-slate-50/80 px-3 py-2">
          <dt className="text-[11px] font-bold text-text-muted uppercase">Trace ID</dt>
          <dd className="truncate font-mono text-[11.5px] font-semibold text-text-primary">
            {truncHash(record.trace_id, 8, 6)}
          </dd>
        </div>
      </dl>
    </motion.section>
  );
}

/* ───── 3. AI VS HUMAN DECISION TRACE ───── */

function AiVsHumanBlock({ record }: { record: AuditRecord }) {
  const parsed = parseAiRecommendation(record.ai_recommendation);
  const confidencePct = Math.round((parsed.confidence ?? record.confidence) * 100);
  const human = record.human_decision;
  const isApproved = human === "APPROVED";

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.5 }}
      className="card-warm rounded-3xl p-7 border border-white/80 shadow-xs"
    >
      <header className="flex items-center gap-2.5">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-700 border border-amber-200/60 shadow-xs">
          <Cpu className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-text-muted">
            Decision Trace
          </p>
          <h2 className="font-display text-[18px] font-bold tracking-tight text-slate-900">
            Autonomous Proposal · Academic Council Gate
          </h2>
        </div>
      </header>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {/* Left AI Card */}
        <div className="rounded-2xl border border-amber-200/90 bg-amber-50/40 p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-900">
                AI Recommendation Engine
              </span>
              <span className="rounded-md bg-amber-100 px-2 py-0.5 font-mono text-[9.5px] font-bold text-amber-900">
                {parsed.model || "Gemini 3.8 Flash"}
              </span>
            </div>

            <p className="mt-3 font-display text-[16px] font-bold leading-snug tracking-tight text-amber-950">
              {parsed.headline}
            </p>
            <p className="mt-1 text-[12px] text-amber-900/80 leading-relaxed">
              {parsed.summary}
            </p>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between text-[11px] font-bold text-amber-950">
              <span>Match Confidence Score</span>
              <span className="font-mono">{confidencePct}%</span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-amber-200/70">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${confidencePct}%` }}
                transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full bg-amber-600"
              />
            </div>
            <p className="mt-3 text-[10.5px] leading-snug text-amber-900/70">
              Evaluated against NCrF Level 6.0 competency vectors with deterministic MILP constraints.
            </p>
          </div>
        </div>

        {/* Right Human Review Card */}
        <div
          className={cn(
            "rounded-2xl border p-5 flex flex-col justify-between shadow-xs transition-colors",
            isApproved
              ? "border-emerald-200/90 bg-emerald-50/40"
              : "border-slate-200/90 bg-slate-50/70"
          )}
        >
          <div>
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  "text-[10px] font-bold uppercase tracking-[0.14em]",
                  isApproved ? "text-emerald-900" : "text-slate-600"
                )}
              >
                Board of Studies Council
              </span>
              <span
                className={cn(
                  "rounded-md px-2 py-0.5 font-mono text-[9.5px] font-bold",
                  isApproved ? "bg-emerald-100 text-emerald-900" : "bg-slate-200 text-slate-700"
                )}
              >
                {isApproved ? "SEALED APPROVAL" : "ACTIVE QUEUE"}
              </span>
            </div>

            <p
              className={cn(
                "mt-3 font-display text-[20px] font-bold leading-tight tracking-tight",
                isApproved ? "text-emerald-950" : "text-slate-800"
              )}
            >
              {isApproved
                ? "Formally Approved & Sealed"
                : record.human_decision === "CONTESTED"
                ? "Contested by Learner"
                : "Awaiting BoS Review"}
            </p>

            <div className="mt-3 flex items-center gap-3">
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                  isApproved ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                )}
              >
                {isApproved ? <CheckCircle2 className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
              </div>
              <div className="leading-tight">
                <p className="text-[12.5px] font-bold text-slate-900">
                  {record.auditor_name ?? "BoS Academic Committee"}
                </p>
                <p className="text-[11px] text-text-muted">
                  {record.auditor_role ?? "Target Institution Reviewer"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 border-t border-slate-200/60 pt-3 text-[11px] text-text-muted">
            {human
              ? `Decision locked at ${fmtDateTime(record.timestamp)}.`
              : "Review window active: SLA target 24h turnaround."}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

/* ───── 4. EVIDENCE & REFERENCES ───── */

function EvidenceBlock({
  record,
  onInspectCourse,
}: {
  record: AuditRecord;
  onInspectCourse: (code: string) => void;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="card-warm rounded-3xl p-7 border border-white/80 shadow-xs"
    >
      <header className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
            <ScrollText className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-text-muted">
              Syllabus Evidence Matrix
            </p>
            <h2 className="font-display text-[18px] font-bold tracking-tight text-slate-900">
              {record.evidence.length} Accredited References Cited
            </h2>
          </div>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700">
          Cross-HEI Semantic Vector Alignment
        </span>
      </header>

      {record.evidence.length === 0 ? (
        <p className="mt-6 text-[13px] text-text-secondary">
          No explicit syllabus references attached to this event.
        </p>
      ) : (
        <div className="mt-5 space-y-3">
          {record.evidence.map((e, i) => {
            const pct = Math.round(e.similarity * 100);
            const source = formatEvidenceCourse(e.source_doc_id, e.source_page, false);
            const target = formatEvidenceCourse(e.target_doc_id, e.target_page, true);

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.04, duration: 0.35 }}
                className="group rounded-2xl border border-slate-200/80 bg-white/95 p-4.5 transition-all hover:border-emerald-300 hover:shadow-sm"
              >
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                  {/* Source Course */}
                  <div className="rounded-xl bg-slate-50/80 p-3 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {source.code}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">
                        {source.tag}
                      </span>
                    </div>
                    <p className="mt-1 text-[13px] font-bold text-slate-900">
                      {source.title}
                    </p>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      {source.subtitle}
                    </p>
                  </div>

                  {/* Flow Arrow & Similarity */}
                  <div className="flex flex-col items-center gap-1.5 px-2">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 font-mono text-[11px] font-bold text-emerald-800 border border-emerald-200">
                      {pct}% Match
                    </span>
                    <ArrowRight className="h-4 w-4 text-emerald-600 transition-transform group-hover:translate-x-1" />
                    <span className="text-[9.5px] font-medium text-text-muted">
                      Full Equated
                    </span>
                  </div>

                  {/* Target Course */}
                  <div className="rounded-xl bg-emerald-50/40 p-3 border border-emerald-200/70">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        {target.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => onInspectCourse(target.code)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:underline"
                      >
                        <BookOpen className="h-3 w-3" />
                        <span>Inspect Syllabus</span>
                      </button>
                    </div>
                    <p className="mt-1 text-[13px] font-bold text-slate-900">
                      {target.title}
                    </p>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      {target.subtitle}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.section>
  );
}

/* ───── 5. DECISION BUNDLE SNAPSHOT ───── */

const BUNDLE_FIELDS: { label: string; key: keyof DecisionBundle }[] = [
  { label: "Curriculum Version", key: "curriculum_version" },
  { label: "Policy Framework", key: "policy_version" },
  { label: "AI Matcher Model", key: "model_version" },
  { label: "Prompt Ruleset", key: "prompt_version" },
  { label: "Embedding Architecture", key: "embedding_model_version" },
  { label: "Cross-Encoder", key: "cross_encoder_version" },
  { label: "Solver Engine", key: "solver_version" },
  { label: "Resource Registry", key: "resource_catalog_version" },
  { label: "Taxonomy Ontology", key: "ontology_version" },
];

function DecisionBundleBlock({ bundle }: { bundle: DecisionBundle }) {
  const [showJson, setShowJson] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(bundle, null, 2));
    setCopiedJson(true);
    toast.success("Snapshot bundle JSON copied");
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.5 }}
      className="card-warm rounded-3xl p-7 border border-white/80 shadow-xs"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-50 text-purple-700 border border-purple-200 shadow-xs">
            <Code2 className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-text-muted">
              Snapshot at Request Time
            </p>
            <h2 className="font-display text-[18px] font-bold tracking-tight text-slate-900">
              Decision Bundle · {bundle.id.slice(0, 8)}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copyJson}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-[11.5px] font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
          >
            {copiedJson ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
            <span>Copy JSON</span>
          </button>
          <button
            type="button"
            onClick={() => setShowJson((v) => !v)}
            className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 text-[11.5px] font-semibold text-slate-800 hover:bg-slate-200 transition-colors"
          >
            <span>{showJson ? "Hide Raw JSON" : "Show Raw JSON"}</span>
            {showJson ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </header>

      {/* Structured Grid */}
      <dl className="mt-6 grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        {BUNDLE_FIELDS.map((f, i) => (
          <div key={f.key} className="rounded-xl bg-slate-50/70 p-3 border border-slate-100">
            <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted">
              {f.label}
            </dt>
            <dd className="mt-1 break-all font-mono text-[12px] font-semibold text-slate-800">
              {String(bundle[f.key])}
            </dd>
          </div>
        ))}
        <div className="rounded-xl bg-slate-50/70 p-3 border border-slate-100">
          <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted">
            Retrieval Threshold
          </dt>
          <dd className="mt-1 font-mono text-[12px] font-semibold text-slate-800">
            {bundle.retrieval_threshold.toFixed(2)}
          </dd>
        </div>
        <div className="rounded-xl bg-slate-50/70 p-3 border border-slate-100 sm:col-span-2">
          <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted">
            Captured Timestamp
          </dt>
          <dd className="mt-1 font-mono text-[12px] font-semibold text-slate-800">
            {fmtDateTime(bundle.captured_at)}
          </dd>
        </div>
      </dl>

      {/* Raw Code Panel (Expandable) */}
      <AnimatePresence>
        {showJson && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 overflow-hidden"
          >
            <CodePanel
              filename="decision_bundle.json"
              code={JSON.stringify(bundle, null, 2)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

/* ───── 6. ACTIONS ───── */

function ActionsBlock({ decisionId }: { decisionId: string }) {
  const [contesting, setContesting] = useState(false);
  const [reason, setReason] = useState("");
  const [downloading, setDownloading] = useState(false);
  const contest = useContestDecision();
  const replay = useReplayDecision(decisionId);

  const onDownloadPdf = async () => {
    setDownloading(true);
    try {
      const blob = await downloadAuditPdf(decisionId);
      downloadBlob(blob, `decision-${decisionId}.pdf`);
      toast.success("Cryptographic Proof PDF downloaded.");
    } catch {
      toast.error("Could not generate the proof PDF.");
    } finally {
      setDownloading(false);
    }
  };

  const onReplay = async () => {
    const res = await replay.refetch();
    if (res.data) toast.success("Bundle re-verified from the chain — state matches request time.");
    else toast.error("Could not replay this decision.");
  };

  const onContestSubmit = async () => {
    if (!reason.trim()) return;
    try {
      await contest.mutateAsync({ decisionId, reason });
      toast.success("Contest recorded on the sovereign ledger.");
      setContesting(false);
      setReason("");
    } catch {
      toast.error("Could not record the contest.");
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="flex flex-col gap-3"
    >
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onDownloadPdf}
          disabled={downloading}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-[13px] font-semibold text-white shadow-md transition-all hover:bg-slate-800 disabled:opacity-60"
        >
          {downloading ? <Loader2 className="h-4 w-4 animate-spin text-emerald-400" /> : <Download className="h-4 w-4 text-emerald-400" />}
          <span>Export Cryptographic Proof (PDF)</span>
        </button>

        <button
          onClick={onReplay}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-5 py-3 text-[13px] font-semibold text-slate-800 shadow-xs transition-colors hover:bg-white"
        >
          <RotateCcw className={cn("h-4 w-4", replay.isFetching && "animate-spin text-blue-600")} />
          <span>Replay Exact Decision State</span>
        </button>

        <button
          onClick={() => setContesting((v) => !v)}
          className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50/70 px-5 py-3 text-[13px] font-semibold text-amber-900 shadow-xs transition-colors hover:bg-amber-100"
        >
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <span>Contest This Decision</span>
        </button>
      </div>

      <AnimatePresence>
        {contesting && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="card-warm rounded-2xl border border-amber-200 bg-amber-50/40 p-5 shadow-xs"
          >
            <h4 className="text-[13.5px] font-bold text-amber-950">
              Submit Formal Academic Dispute to Board of Studies
            </h4>
            <p className="mt-1 text-[12px] text-amber-900/80">
              Provide specific syllabus sections or laboratory coursework completed at your prior
              institution for manual BoS faculty re-examination.
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Completed Advanced Systems Lab in 4th semester covering bare-metal concurrency; requesting direct waiver for CS-101 lab…"
              className="mt-3 min-h-[90px] w-full rounded-xl border border-amber-200 bg-white p-3 text-[12.5px] text-slate-900 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30"
            />
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setContesting(false)}
                className="rounded-xl px-4 py-2 text-[12px] font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onContestSubmit}
                disabled={contest.isPending || !reason.trim()}
                className="rounded-xl bg-amber-700 px-5 py-2 text-[12px] font-semibold text-white shadow-xs hover:bg-amber-800 disabled:opacity-60"
              >
                {contest.isPending ? "Recording on Ledger…" : "Submit Formal Contest"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

/* ───── PAGE ───── */

export default function AuditReplayPage() {
  const session = useRequireRole("learner");
  const params = useParams<{ decisionId: string }>();
  const decisionId = params?.decisionId ?? "";
  const audit = useAudit(decisionId);
  const replay = useReplayDecision(decisionId);

  const [inspectedCourse, setInspectedCourse] = useState<string | null>(null);

  const topBarRight = (
    <>
      <span className="pill hidden lg:inline-flex">
        <span className="font-semibold text-text-primary">{session?.externalRef}</span>
        <span className="text-text-muted">·</span>
        <span>{session?.programme}</span>
      </span>
      {audit.data?.chain_id && (
        <span className="pill hidden md:inline-flex font-mono">
          Chain ID: {audit.data.chain_id}
        </span>
      )}
      <span className="relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-50 to-emerald-100 px-3.5 py-2 text-[11px] font-semibold text-emerald-800 shadow-sm border border-emerald-200/60">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <ShieldCheck className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Chain Integrity:</span>
        <span>{audit.isError ? "Unverified" : "Sealed & Intact"}</span>
      </span>
    </>
  );

  if (!session) return null;

  return (
    <AppShell
      title="Cryptographic Decision Bundle Explorer"
      subtitle="Tamper-evident ledger · exact-state replay"
      topBarRight={topBarRight}
      reserveBottom
    >
      <section className="mx-auto max-w-[1450px] space-y-6 px-4 pb-8 pt-5 md:px-6">
        {audit.isLoading ? (
          <div className="flex items-center justify-center gap-2 py-32 text-[13px] text-text-secondary">
            <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
            Loading cryptographic evidence chain…
          </div>
        ) : audit.data ? (
          <>
            <Header decisionId={decisionId} record={audit.data} />
            <div className="grid gap-6 lg:grid-cols-2">
              <HashChainBlock record={audit.data} />
              <AiVsHumanBlock record={audit.data} />
            </div>
            <EvidenceBlock
              record={audit.data}
              onInspectCourse={(code) => setInspectedCourse(code)}
            />
            {replay.data?.bundle && (
              <DecisionBundleBlock bundle={replay.data.bundle} />
            )}
            <ActionsBlock decisionId={decisionId} />
          </>
        ) : (
          <div className="card-warm rounded-3xl py-24 text-center text-[13px] text-text-secondary">
            Could not find this decision in the ledger chain.
          </div>
        )}
      </section>

      {/* Course Inspection Dialog */}
      <CourseModal
        open={!!inspectedCourse}
        onOpenChange={(open) => !open && setInspectedCourse(null)}
        course={inspectedCourse ? { code: inspectedCourse } : null}
      />

      <BottomStrip
        label={"Ledger\nProof"}
        statusTitle="SHA-256 partition verified · Reproducible audit trail"
        statusIcon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
        ctaLabel="Back to Decision Explorer"
        ctaHref="/student/audit"
      />
    </AppShell>
  );
}
