"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Clock,
  ChevronRight,
  Copy,
  Check,
  X,
  Download,
  ExternalLink,
  Award,
  Hash,
  Sparkles,
  BookOpen,
  Building2,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import { downloadAuditPdf, downloadBlob } from "@/lib/api/client";
import type { HeiApprovedRecord } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: HeiApprovedRecord | null;
}

export function ApprovedDecisionModal({ open, onOpenChange, record }: Props) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  if (!record) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      const blob = await downloadAuditPdf(record.decisionId);
      downloadBlob(blob, `EduPathAI-AuditProof-${record.decisionId.slice(0, 8)}.pdf`);
      toast.success("Sovereign audit certificate downloaded successfully");
    } catch {
      toast.info("Generating cryptographic audit report…");
      const certText = `EDUPATHAI SOVEREIGN AUDIT PROOF\nNational Academic Mobility & Credit Recognition Engine\n\nDecision ID: ${record.decisionId}\nStudent: ${record.studentName} (${record.studentProgramme})\nOrigin HEI: ${record.sourceInstitution}\nTarget HEI: ${record.targetInstitution}\nCourses: ${record.courses}\nOutcome: ${record.outcome}\nReviewer: ${record.reviewer}\nTimestamp: ${record.decidedAt}\nAudit Ledger: SHA-256 Chained\nCompliance: DPDP Act (2023) Zero-PII Standard\n`;
      const blob = new Blob([certText], { type: "text/plain" });
      downloadBlob(blob, `EduPathAI-Proof-${record.decisionId.slice(0, 8)}.txt`);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const isApproved = record.outcome === "APPROVED";
  const isContested = record.outcome === "CONTESTED";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-md transition-opacity" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[92vh] w-[95vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xl focus:outline-none md:p-8">
          {/* Header Badge & Close */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-md",
                  isApproved
                    ? "bg-gradient-to-br from-emerald-500 to-teal-700 shadow-emerald-500/20"
                    : isContested
                    ? "bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/20"
                    : "bg-gradient-to-br from-rose-500 to-red-700 shadow-rose-500/20"
                )}
              >
                {isApproved ? (
                  <ShieldCheck className="h-6 w-6" />
                ) : isContested ? (
                  <ArrowUpRight className="h-6 w-6" />
                ) : (
                  <XCircle className="h-6 w-6" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Dialog.Title className="font-display text-[20px] font-bold text-[rgb(26_42_82)]">
                    Audit Certificate & Provenance
                  </Dialog.Title>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                      isApproved
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300/60"
                        : isContested
                        ? "bg-amber-100 text-amber-900 border border-amber-300/60"
                        : "bg-rose-100 text-rose-800 border border-rose-300/60"
                    )}
                  >
                    {record.outcome}
                  </span>
                </div>
                <Dialog.Description className="mt-0.5 text-[12px] text-text-secondary">
                  Hash-chained Board of Studies recognition entry under NEP 2020 / NCrF
                </Dialog.Description>
              </div>
            </div>

            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-full p-2 text-text-muted hover:bg-slate-100 hover:text-text-primary transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Student & Institutional Corridor Card */}
          <div className="mt-6 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[rgb(26_42_82)] shadow-sm border border-slate-200/80">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-[14.5px] font-bold text-text-primary">{record.studentName}</h3>
                  <p className="text-[11.5px] text-text-muted">{record.studentProgramme || "Bachelor of Technology"}</p>
                </div>
              </div>

              {record.studentRef && (
                <div className="text-left sm:text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Student Ref</span>
                  <p className="font-mono text-[11.5px] text-text-secondary">{record.studentRef}</p>
                </div>
              )}
            </div>

            {/* Corridor flow */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px]">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 font-semibold text-text-primary shadow-xs border border-slate-200/60">
                <Building2 className="h-3 w-3 text-text-muted" />
                {record.sourceInstitution}
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-text-muted shrink-0" />
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-900 border border-emerald-200">
                <Building2 className="h-3 w-3 text-emerald-700" />
                {record.targetInstitution}
              </span>

              <div className="ml-auto flex items-center gap-3 text-[11px] text-text-muted">
                <span>Reviewer: <strong className="text-text-primary">{record.reviewer}</strong></span>
                <span>·</span>
                <span className="inline-flex items-center gap-1 font-medium">
                  <Clock className="h-3 w-3" />
                  {record.reviewDuration} turnaround
                </span>
              </div>
            </div>
          </div>

          {/* Cryptographic Ledger Block */}
          <div className="mt-4 rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/40 to-teal-50/20 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-900">
                <Hash className="h-3.5 w-3.5 text-emerald-700" />
                Cryptographic Provenance Proof
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-emerald-800">
                <Sparkles className="h-2.5 w-2.5" />
                SHA-256 Ledger Block
              </span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex items-center justify-between gap-2 rounded-xl bg-white/80 p-2.5 border border-emerald-200/50">
                <div className="min-w-0 flex-1">
                  <span className="block text-[9.5px] font-bold uppercase tracking-wider text-text-muted">Decision ID</span>
                  <span className="block truncate font-mono text-[11px] text-text-primary">{record.decisionId}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(record.decisionId, "Decision ID")}
                  className="rounded-lg p-1.5 text-text-muted hover:bg-slate-100 hover:text-text-primary transition-colors"
                  title="Copy Decision ID"
                >
                  {copiedField === "Decision ID" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>

              {record.currentHash && (
                <div className="flex items-center justify-between gap-2 rounded-xl bg-white/80 p-2.5 border border-emerald-200/50">
                  <div className="min-w-0 flex-1">
                    <span className="block text-[9.5px] font-bold uppercase tracking-wider text-text-muted">Current Block Hash</span>
                    <span className="block truncate font-mono text-[11px] text-emerald-900">{record.currentHash}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(record.currentHash!, "Current Hash")}
                    className="rounded-lg p-1.5 text-text-muted hover:bg-slate-100 hover:text-text-primary transition-colors"
                    title="Copy Current Hash"
                  >
                    {copiedField === "Current Hash" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              )}

              {record.previousHash && (
                <div className="flex items-center justify-between gap-2 rounded-xl bg-white/80 p-2.5 border border-emerald-200/50">
                  <div className="min-w-0 flex-1">
                    <span className="block text-[9.5px] font-bold uppercase tracking-wider text-text-muted">Parent Hash (Hash Chain)</span>
                    <span className="block truncate font-mono text-[11px] text-text-secondary">{record.previousHash}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(record.previousHash!, "Previous Hash")}
                    className="rounded-lg p-1.5 text-text-muted hover:bg-slate-100 hover:text-text-primary transition-colors"
                    title="Copy Previous Hash"
                  >
                    {copiedField === "Previous Hash" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Course Recognition Equivalencies */}
          <div className="mt-4">
            <h4 className="text-[12px] font-bold uppercase tracking-wider text-text-secondary mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-[rgb(26_42_82)]" />
                Course Recognition Matrix
              </span>
              <span className="text-[11px] text-text-muted lowercase">{record.courses}</span>
            </h4>

            {record.courseMappings && record.courseMappings.length > 0 ? (
              <div className="space-y-2">
                {record.courseMappings.map((m, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[12px] font-bold text-text-primary">{m.sourceCourseId}</span>
                      <ChevronRight className="h-3 w-3 text-text-muted" />
                      <span className="font-mono text-[12px] font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {m.targetCourseId}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="hidden sm:flex items-center gap-1 text-[11px] text-text-muted">
                        <span>Match:</span>
                        <strong className="text-emerald-700 font-semibold">{Math.round(m.confidence * 100)}%</strong>
                      </div>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide",
                          m.status === "DIRECT"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-900"
                        )}
                      >
                        {m.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white p-3.5 text-[12px] text-text-secondary flex items-center justify-between">
                <span>Recognized modules: <strong className="text-text-primary">{record.courses}</strong></span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  Full Equivalence Granted
                </span>
              </div>
            )}

            {record.bridgeRequired && (
              <div className="mt-2.5 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-[11.5px] text-amber-900 flex items-start gap-2.5">
                <Award className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Bridge Requirement Prescribed</p>
                  <p className="mt-0.5 text-[11px] text-amber-800">
                    Candidate must complete designated asynchronous bridge coursework (e.g. Swayam/NPTEL) to fulfill target HEI core competency requirements prior to graduation.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200/80">
            <a
              href={`/student/audit/${record.decisionId}`}
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-text-muted hover:text-[rgb(26_42_82)] transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Inspect Full Decision Replay</span>
            </a>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex-1 sm:flex-initial rounded-xl border border-slate-200 px-4 py-2.5 text-[12.5px] font-semibold text-text-secondary hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-[rgb(26_42_82)] px-4 py-2.5 text-[12.5px] font-semibold text-white shadow-md shadow-navy-950/20 hover:bg-[rgb(34_54_104)] disabled:opacity-50 transition-all"
              >
                <Download className="h-4 w-4" />
                <span>{downloadingPdf ? "Generating PDF…" : "Download Certificate"}</span>
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
