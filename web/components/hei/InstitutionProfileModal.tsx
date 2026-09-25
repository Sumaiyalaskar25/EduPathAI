"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Building2,
  MapPin,
  GraduationCap,
  Users,
  TrendingUp,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  PauseCircle,
  ExternalLink,
  Download,
  X,
  FileCheck2,
  Sparkles,
  BookOpen,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { downloadBlob } from "@/lib/api/client";
import type { HeiInstitution } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  institution: HeiInstitution | null;
}

const TYPE_BADGE_STYLE: Record<string, string> = {
  "IIT / NIT / INI": "bg-indigo-100 text-indigo-900 border-indigo-200",
  "State & Central Universities": "bg-emerald-100 text-emerald-900 border-emerald-200",
  "Autonomous Engineering Colleges": "bg-sky-100 text-sky-900 border-sky-200",
  "Deemed & Private Universities": "bg-amber-100 text-amber-900 border-amber-200",
};

export function InstitutionProfileModal({ open, onOpenChange, institution }: Props) {
  const [exporting, setExporting] = useState(false);

  if (!institution) return null;

  const handleExportBrief = () => {
    try {
      setExporting(true);
      const brief = {
        title: "EduPathAI Institution Governance & Recognition Profile",
        institutionId: institution.id,
        name: institution.name,
        shortName: institution.shortName,
        category: institution.type,
        location: {
          city: institution.city,
          state: institution.state,
        },
        accreditation: {
          naacGrade: institution.naac || "A+",
          aisheCode: institution.aisheCode || `U-${institution.id.replace("INST-", "")}`,
          nirfTier: institution.nirfTier || "Tier-1 Accredited",
        },
        networkStatus: institution.status,
        onboardedAt: institution.joined_at,
        telemetry: {
          activeStudents: institution.studentsActive,
          decisionsThisMonth: institution.decisionsThisMonth,
          recognitionRate: `${Math.round(institution.recognitionRate * 100)}%`,
          averageReviewTime: institution.avgReviewTime,
        },
        regulatoryFramework: {
          nep2020MultipleEntryExit: "Compliant",
          nationalCreditFrameworkNCrF: "Level 4.5 / 5.0 / 6.0 Validated",
          academicBankOfCreditsABC: "Federated Node Synchronized",
          zeroPiiDPDPAct: "Enforced",
        },
      };

      const blob = new Blob([JSON.stringify(brief, null, 2)], { type: "application/json" });
      downloadBlob(blob, `EduPathAI-Profile-${institution.shortName.replace(/\s+/g, "_")}.json`);
      toast.success("Institutional accreditation brief exported");
    } catch {
      toast.error("Failed to export institutional brief");
    } finally {
      setExporting(false);
    }
  };

  const badgeClass = TYPE_BADGE_STYLE[institution.type] || "bg-slate-100 text-slate-800 border-slate-200";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-md transition-opacity" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[92vh] w-[95vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xl focus:outline-none md:p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
            <div className="flex items-start gap-3.5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[rgb(26_42_82)] to-[rgb(14_22_48)] text-white shadow-md shadow-navy-950/20">
                <Building2 className="h-7 w-7" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Dialog.Title className="font-display text-[20px] font-bold text-[rgb(26_42_82)]">
                    {institution.shortName}
                  </Dialog.Title>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                      institution.status === "active"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : "bg-amber-100 text-amber-900 border border-amber-200"
                    )}
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    {institution.status.toUpperCase()} PARTNER
                  </span>
                </div>
                <p className="mt-1 text-[13px] text-text-secondary leading-snug">{institution.name}</p>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-text-muted">
                  <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-bold border", badgeClass)}>
                    {institution.type}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-text-muted" />
                    {institution.city}, {institution.state}
                  </span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <GraduationCap className="h-3 w-3" />
                    NAAC {institution.naac || "A+"}
                  </span>
                </div>
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

          {/* Telemetry Metrics */}
          <div className="mt-6">
            <h4 className="text-[11.5px] font-bold uppercase tracking-wider text-text-secondary mb-2.5 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              Live Recognition Telemetry & Corridor Metrics
            </h4>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1">
                  <Users className="h-3 w-3" /> Active Pipeline
                </span>
                <p className="mt-1 font-display text-[22px] font-bold text-text-primary">
                  {institution.studentsActive}
                </p>
                <span className="text-[10px] text-text-muted">Inbound / Outbound</span>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> Approval Rate
                </span>
                <p className="mt-1 font-display text-[22px] font-bold text-emerald-700">
                  {Math.round(institution.recognitionRate * 100)}%
                </p>
                <span className="text-[10px] text-emerald-800/80">Equivalency Index</span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1">
                  <FileCheck2 className="h-3 w-3" /> Monthly Volume
                </span>
                <p className="mt-1 font-display text-[22px] font-bold text-text-primary">
                  {institution.decisionsThisMonth}
                </p>
                <span className="text-[10px] text-text-muted">Decisions logged</span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Turnaround
                </span>
                <p className="mt-1 font-display text-[20px] font-bold text-text-primary truncate">
                  {institution.avgReviewTime}
                </p>
                <span className="text-[10px] text-text-muted">BoS review cycle</span>
              </div>
            </div>
          </div>

          {/* Academic Bank of Credits & Regulatory Card */}
          <div className="mt-5 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-emerald-50/30 p-4">
            <h4 className="text-[11.5px] font-bold uppercase tracking-wider text-text-primary mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-700" />
                Statutory Accreditation & Sovereign Network Status
              </span>
              <span className="font-mono text-[11px] text-text-muted">
                {institution.aisheCode || `AISHE: U-${institution.id.replace("INST-", "")}`}
              </span>
            </h4>

            <div className="space-y-2 text-[12px]">
              <div className="flex items-center justify-between rounded-xl bg-white p-2.5 border border-slate-200/60 shadow-xs">
                <span className="text-text-secondary">UGC Academic Bank of Credits (ABC) Status:</span>
                <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200">
                  Federated Node Active
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-white p-2.5 border border-slate-200/60 shadow-xs">
                <span className="text-text-secondary">National Credit Framework (NCrF) Alignment:</span>
                <span className="font-semibold text-text-primary text-[11px]">Level 4.5 / 5.0 / 6.0 Compliant</span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-white p-2.5 border border-slate-200/60 shadow-xs">
                <span className="text-text-secondary">Data Protection & Privacy Standard:</span>
                <span className="font-semibold text-text-primary text-[11px]">DPDP Act (2023) Zero-PII Architecture</span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-white p-2.5 border border-slate-200/60 shadow-xs">
                <span className="text-text-secondary">Corridor Cryptographic Security:</span>
                <span className="font-mono text-emerald-800 text-[11px] font-semibold">SHA-256 Chained Ledger</span>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <a
              href="/gov/mobility"
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-text-muted hover:text-[rgb(26_42_82)] transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Explore State Mobility Sankey</span>
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
                onClick={handleExportBrief}
                disabled={exporting}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-[rgb(26_42_82)] px-4 py-2.5 text-[12.5px] font-semibold text-white shadow-md shadow-navy-950/20 hover:bg-[rgb(34_54_104)] disabled:opacity-50 transition-all"
              >
                <Download className="h-4 w-4" />
                <span>{exporting ? "Exporting…" : "Export Brief (JSON)"}</span>
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
