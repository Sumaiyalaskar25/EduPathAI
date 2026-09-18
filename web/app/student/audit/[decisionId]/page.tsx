"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
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
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { BottomStrip } from "@/components/layout/BottomStrip";
import { CodePanel } from "@/components/ledger/CodePanel";
import {
  DEMO_AUDIT_RECORD,
  DEMO_DECISION_BUNDLE,
  DEMO_AUDIT_BUNDLE_JSON,
} from "@/lib/constants/demo-audit";
import { DEMO_CHAIN, DEMO_STUDENT } from "@/lib/constants/demo";
import { cn } from "@/lib/utils/cn";

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

function truncHash(h: string, head = 8, tail = 6): string {
  if (h.length <= head + tail + 3) return h;
  return `${h.slice(0, head)}…${h.slice(-tail)}`;
}

/* ───── 1. HEADER ───── */

function Header({ decisionId }: { decisionId: string }) {
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
          Back to ledger
        </Link>

        <h1 className="mt-3 font-display text-[32px] font-bold leading-tight tracking-tighter text-[rgb(26_42_82)] md:text-[38px]">
          Decision Replay
        </h1>
        <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-text-secondary">
          Every decision is reproducible. This is the evidence chain captured
          at request time — immutable, tamper-evident, and fully replayable.
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-start gap-2 md:items-end">
        <span className="rounded-full border border-border-subtle bg-white/80 px-3.5 py-1.5 font-mono text-[11px] font-medium text-text-secondary">
          {decisionId}
        </span>
        <span className="text-[11px] font-medium text-text-muted">
          {fmtDateTime(DEMO_AUDIT_RECORD.timestamp)}
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
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4 transition-colors",
        highlight
          ? "border-emerald-300/70 bg-emerald-50/60"
          : "border-border-subtle bg-white/70"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted">
          {label}
        </span>
        {highlight && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-emerald-800">
            <CheckCircle2 className="h-2.5 w-2.5" />
            Verified
          </span>
        )}
      </div>
      <p className="mt-2 break-all font-mono text-[12.5px] leading-relaxed text-text-primary">
        {value}
      </p>
    </div>
  );
}

function HashChainBlock() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.5 }}
      className="card-warm rounded-3xl p-7"
    >
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[rgb(26_42_82)]/10">
            <Hash className="h-4 w-4 text-[rgb(26_42_82)]" />
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
              Hash Chain
            </p>
            <h2 className="font-display text-[17px] font-bold tracking-tight text-text-primary">
              Partitioned SHA-256 ledger
            </h2>
          </div>
        </div>
        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
          Chain Intact
        </span>
      </header>

      <div className="mt-6 space-y-2.5">
        <HashRow
          label="Previous · head_hash"
          value={DEMO_AUDIT_RECORD.previous_hash}
        />
        <div className="flex items-center gap-3 pl-4">
          <span className="h-6 w-px bg-gradient-to-b from-transparent via-border-strong to-transparent" />
          <span className="rounded-full border border-border-subtle bg-canvas px-2.5 py-1 font-mono text-[10.5px] text-text-secondary">
            sha256(prev ‖ input_hash ‖ output_hash)
          </span>
        </div>
        <HashRow
          label="Current · head_hash"
          value={DEMO_AUDIT_RECORD.current_hash}
          highlight
        />
      </div>

      <dl className="mt-6 grid gap-3 border-t border-border-subtle pt-5 text-[12px] md:grid-cols-2">
        <div className="flex items-center justify-between gap-2">
          <dt className="text-text-muted">Input hash</dt>
          <dd className="truncate font-mono text-text-primary">
            {truncHash(DEMO_AUDIT_RECORD.input_hash)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-text-muted">Output hash</dt>
          <dd className="truncate font-mono text-text-primary">
            {truncHash(DEMO_AUDIT_RECORD.output_hash)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-text-muted">Chain ID</dt>
          <dd className="font-mono text-text-primary">
            {DEMO_AUDIT_RECORD.chain_id}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-text-muted">Trace ID</dt>
          <dd className="truncate font-mono text-text-primary">
            {DEMO_AUDIT_RECORD.trace_id}
          </dd>
        </div>
      </dl>
    </motion.section>
  );
}

/* ───── 3. AI VS HUMAN ───── */

function AiVsHumanBlock() {
  const ai = DEMO_AUDIT_RECORD.ai_recommendation;
  const human = DEMO_AUDIT_RECORD.human_decision;
  const confidencePct = Math.round(DEMO_AUDIT_RECORD.confidence * 100);

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.5 }}
      className="card-warm rounded-3xl p-7"
    >
      <header className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100">
          <Cpu className="h-4 w-4 text-amber-700" />
        </span>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
            Decision Trace
          </p>
          <h2 className="font-display text-[17px] font-bold tracking-tight text-text-primary">
            AI proposes · Human approves
          </h2>
        </div>
      </header>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {/* AI card */}
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-5">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-amber-900">
            AI Recommendation
          </p>
          <p className="mt-2 font-display text-[22px] font-bold leading-tight tracking-tight text-amber-950">
            {ai}
          </p>
          <div className="mt-4">
            <div className="flex items-center justify-between text-[11px] font-medium">
              <span className="text-amber-900/80">Confidence</span>
              <span className="font-mono text-amber-950">{confidencePct}%</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-amber-200/60">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${confidencePct}%` }}
                transition={{ delay: 0.4, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full bg-amber-500"
              />
            </div>
          </div>
          <p className="mt-4 text-[11px] leading-snug text-amber-900/70">
            Generated by consensus of Gemini 2.0 Flash + DeepSeek Chat with
            structured outcome extraction.
          </p>
        </div>

        {/* Human card */}
        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-5">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-emerald-900">
            Human Decision
          </p>
          <p className="mt-2 font-display text-[22px] font-bold leading-tight tracking-tight text-emerald-950">
            {human ?? "Awaiting review"}
          </p>

          <div className="mt-4 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15">
              <CheckCircle2 className="h-4 w-4 text-emerald-700" />
            </span>
            <div className="leading-tight">
              <p className="text-[12px] font-semibold text-emerald-950">
                {DEMO_AUDIT_RECORD.auditor_name}
              </p>
              <p className="text-[10.5px] text-emerald-900/70">
                {DEMO_AUDIT_RECORD.auditor_role}
              </p>
            </div>
          </div>

          <p className="mt-4 text-[11px] leading-snug text-emerald-900/70">
            Signed via Aadhaar e-Sign at {fmtDateTime(DEMO_AUDIT_RECORD.timestamp)}.
          </p>
        </div>
      </div>
    </motion.section>
  );
}

/* ───── 4. DECISION BUNDLE (metadata grid) ───── */

const BUNDLE_FIELDS: { label: string; key: keyof typeof DEMO_DECISION_BUNDLE }[] = [
  { label: "Curriculum", key: "curriculum_version" },
  { label: "Policy", key: "policy_version" },
  { label: "Model", key: "model_version" },
  { label: "Prompt", key: "prompt_version" },
  { label: "Embedding", key: "embedding_model_version" },
  { label: "Cross-encoder", key: "cross_encoder_version" },
  { label: "Solver", key: "solver_version" },
  { label: "Resource catalog", key: "resource_catalog_version" },
  { label: "Ontology", key: "ontology_version" },
];

function DecisionBundleBlock() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="card-warm rounded-3xl p-7"
    >
      <header className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[rgb(26_42_82)]/10">
          <ScrollText className="h-4 w-4 text-[rgb(26_42_82)]" />
        </span>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
            Snapshot at Request Time
          </p>
          <h2 className="font-display text-[17px] font-bold tracking-tight text-text-primary">
            Decision Bundle · {DEMO_DECISION_BUNDLE.id}
          </h2>
        </div>
      </header>

      <dl className="mt-6 grid gap-x-6 gap-y-4 md:grid-cols-2 lg:grid-cols-3">
        {BUNDLE_FIELDS.map((f, i) => (
          <motion.div
            key={f.key}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + i * 0.03, duration: 0.35 }}
          >
            <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted">
              {f.label}
            </dt>
            <dd className="mt-1 break-all font-mono text-[12px] text-text-primary">
              {String(DEMO_DECISION_BUNDLE[f.key])}
            </dd>
          </motion.div>
        ))}
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted">
            Retrieval threshold
          </dt>
          <dd className="mt-1 font-mono text-[12px] text-text-primary">
            {DEMO_DECISION_BUNDLE.retrieval_threshold.toFixed(2)}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted">
            Captured at
          </dt>
          <dd className="mt-1 font-mono text-[12px] text-text-primary">
            {fmtDateTime(DEMO_DECISION_BUNDLE.captured_at)}
          </dd>
        </div>
      </dl>

      <div className="mt-7">
        <CodePanel
          filename="decision_bundle.json"
          code={DEMO_AUDIT_BUNDLE_JSON}
        />
      </div>
    </motion.section>
  );
}

/* ───── 5. EVIDENCE LIST ───── */

function EvidenceBlock() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.5 }}
      className="card-warm rounded-3xl p-7"
    >
      <header className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
          <FileText className="h-4 w-4 text-emerald-700" />
        </span>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
            Evidence
          </p>
          <h2 className="font-display text-[17px] font-bold tracking-tight text-text-primary">
            {DEMO_AUDIT_RECORD.evidence.length} references cited
          </h2>
        </div>
      </header>

      <ul className="mt-6 space-y-3">
        {DEMO_AUDIT_RECORD.evidence.map((e, i) => {
          const pct = Math.round(e.similarity * 100);
          const tone =
            pct >= 85
              ? "emerald"
              : pct >= 65
              ? "amber"
              : "rose";
          const toneChip = {
            emerald: "bg-emerald-100 text-emerald-800",
            amber: "bg-amber-100 text-amber-900",
            rose: "bg-rose-100 text-rose-800",
          }[tone];

          return (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.05, duration: 0.4 }}
              className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-2xl border border-border-subtle bg-white/70 p-4 transition-all hover:border-emerald-200 hover:shadow-sm"
            >
              {/* Source */}
              <div className="min-w-0">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">
                  {e.source_doc_id}
                </p>
                <p className="mt-0.5 text-[12.5px] font-medium text-text-primary">
                  {e.source_page}
                </p>
              </div>

              {/* Arrow + score */}
              <div className="flex flex-col items-center gap-1">
                <ArrowRight className="h-3.5 w-3.5 text-text-muted" />
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums",
                    toneChip
                  )}
                >
                  {pct}%
                </span>
              </div>

              {/* Target */}
              <div className="min-w-0 text-right">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">
                  {e.target_doc_id}
                </p>
                <p className="mt-0.5 text-[12.5px] font-medium text-text-primary">
                  {e.target_page}
                </p>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </motion.section>
  );
}

/* ───── 6. ACTIONS ───── */

function ActionsBlock() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="flex flex-wrap gap-3"
    >
      <button className="pill-navy">
        <Download className="h-4 w-4" />
        <span>Export Cryptographic Proof (PDF)</span>
      </button>
      <button className="flex items-center gap-2 rounded-full border border-border-strong bg-white/80 px-5 py-3 text-[13px] font-semibold text-text-primary transition-colors hover:bg-white">
        <RotateCcw className="h-4 w-4" />
        <span>Replay exact decision state</span>
      </button>
      <button className="flex items-center gap-2 rounded-full border border-border-subtle bg-white/70 px-5 py-3 text-[13px] font-semibold text-text-secondary transition-colors hover:bg-white">
        <AlertTriangle className="h-4 w-4" />
        <span>Contest this decision</span>
      </button>
    </motion.section>
  );
}

/* ───── PAGE ───── */

export default function AuditReplayPage() {
  const params = useParams<{ decisionId: string }>();
  const decisionId = params?.decisionId ?? DEMO_AUDIT_RECORD.decision_id;

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
      title="Cryptographic Decision Bundle Explorer"
      subtitle="Tamper-evident ledger · exact-state replay"
      topBarRight={topBarRight}
      reserveBottom
    >
      <section className="mx-auto max-w-[1400px] space-y-5 px-4 pb-4 pt-4 md:px-6">
        <Header decisionId={decisionId} />

        <div className="grid gap-5 lg:grid-cols-2">
          <HashChainBlock />
          <AiVsHumanBlock />
        </div>

        <DecisionBundleBlock />

        <EvidenceBlock />

        <ActionsBlock />
      </section>

      <BottomStrip
        label={"Audit Sync\nStatus"}
        statusTitle="HEI Board of Studies pre-approved bridge pathway"
        statusIcon={<ShieldCheck className="h-4 w-4" />}
        ctaLabel="Proceed & Update Academic Plan"
      />
    </AppShell>
  );
}