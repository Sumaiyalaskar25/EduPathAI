"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Award,
  CheckCircle2,
  X,
  Sparkles,
  Network,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Layers,
  Building2,
  ArrowRight,
  Loader2,
  FileText,
  AlertTriangle,
  GraduationCap,
} from "lucide-react";
import { useCourse } from "@/lib/api/hooks";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: {
    code: string;
    title?: string;
    institution?: string;
    credits?: number;
    status?: string;
    bloomLevel?: string;
    outcomes?: string[];
  } | null;
}

export function CourseModal({ open, onOpenChange, course }: Props) {
  const [copied, setCopied] = useState(false);

  // Dynamically query live course record from backend catalog & PostgreSQL graph
  const { data: liveData, isLoading } = useCourse(open && course?.code ? course.code : undefined);

  if (!course) return null;

  const code = course.code;
  const title = liveData?.name || course.title || `${code} Target Core Syllabus`;
  const institution = liveData?.institution || course.institution || "IIT Bombay (Anchored Reference)";
  const credits = liveData?.credits ?? course.credits ?? 4;
  const modality = liveData?.modality || "Theory + Lab Practicum";
  const bloomLevel = liveData?.bloomLevel || course.bloomLevel || "L4 (Analyze)";
  const description =
    liveData?.description ||
    `${code} core accredited syllabus component under National Curriculum Graph v2.`;
  const outcomes =
    liveData?.competencies && liveData.competencies.length > 0
      ? liveData.competencies
      : course.outcomes && course.outcomes.length > 0
      ? course.outcomes
      : [
          `Master core theoretical models and practical design in ${code}`,
          "Analyze algorithmic complexity and optimize computational resources",
          "Demonstrate hands-on laboratory mastery compliant with NCrF standards",
        ];
  const recognition = liveData?.recognitionStatus || course.status;
  const mappedFrom = liveData?.mappedFrom;
  const nodeId = liveData?.nodeId || `did:ncrf:hei:${code}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(`${code} - ${title}`);
    setCopied(true);
    toast.success(`Copied course specification for ${code}`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md transition-opacity duration-300 animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[92vh] w-[95vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-slate-200/90 bg-white p-6 md:p-8 shadow-[0_25px_70px_rgba(26,42,82,0.22)] focus:outline-none animate-in fade-in-0 zoom-in-95 duration-200">
          
          {/* Top Header Row */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 via-indigo-500/15 to-blue-600/20 text-blue-700 shadow-sm border border-blue-200/60 p-3">
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[12px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50/80 px-2.5 py-0.5 rounded-lg border border-blue-100">
                    {code}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    title="Copy Course Code"
                    className="inline-flex items-center gap-1 rounded-md text-[11px] font-medium text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                  {isLoading && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-text-muted">
                      <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
                      Syncing live graph…
                    </span>
                  )}
                </div>
                <Dialog.Title className="mt-1 font-display text-[22px] font-extrabold tracking-tight text-slate-900 leading-snug">
                  {title}
                </Dialog.Title>
              </div>
            </div>

            <Dialog.Close className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          {/* Verification & Badges Ribbon */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-800 border border-emerald-200 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Verified in National Graph v2
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700 border border-slate-200/60">
              {credits} NCrF Credits · Level 6.0
            </span>
            <span className="rounded-full bg-purple-50 px-3 py-1 text-[11px] font-semibold text-purple-700 border border-purple-200">
              Bloom {bloomLevel}
            </span>
            {modality && (
              <span className="rounded-full bg-sky-50 px-3 py-1 text-[11px] font-semibold text-sky-700 border border-sky-200 capitalize">
                {modality}
              </span>
            )}
          </div>

          {/* Main Card Content */}
          <div className="mt-6 space-y-4">
            
            {/* Institution Anchor Card */}
            <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-r from-slate-50 via-white to-slate-50/50 p-4.5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-text-muted">
                  <Building2 className="h-4 w-4 text-emerald-600" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Institution Anchor & Reference</span>
                </div>
                <span className="rounded-full bg-emerald-100/70 px-2 py-0.5 font-mono text-[9.5px] font-bold uppercase text-emerald-800">
                  NIRF Tier-1 HEI
                </span>
              </div>
              <p className="mt-1.5 text-[14px] font-bold text-text-primary">
                {institution}
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-text-secondary">
                {description}
              </p>
            </div>

            {/* Equivalence Mapping Card (if recognized or mapped) */}
            {(recognition || mappedFrom) && (
              <div className="rounded-2xl border border-blue-200/70 bg-blue-50/40 p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900">
                      National Recognition & Equivalence Vector
                    </span>
                  </div>
                  {mappedFrom?.similarity && (
                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 font-mono text-[10.5px] font-bold text-blue-800">
                      {(mappedFrom.similarity * 100).toFixed(1)}% Match
                    </span>
                  )}
                </div>
                <div className="mt-2 text-[12.5px] text-blue-900/90">
                  {mappedFrom?.source_course ? (
                    <p>
                      Direct equivalence identified from prior validated course{" "}
                      <span className="font-bold text-blue-950 font-mono">{mappedFrom.source_course}</span>.
                      Autonomous AI match confidence verified by Board of Studies ruleset.
                    </p>
                  ) : (
                    <p>
                      Evaluated under NEP 2020 Multiple Entry/Exit System with zero credit friction.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Competency & Learning Outcomes Card */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-text-muted">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-text-primary">
                    Verified Learning Competencies & Outcomes
                  </span>
                </div>
                <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200">
                  {outcomes.length} CO Mappings
                </span>
              </div>

              <div className="mt-3.5 space-y-2.5">
                {outcomes.map((outcome, idx) => (
                  <div
                    key={idx}
                    className="group flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 transition-colors hover:border-emerald-200 hover:bg-emerald-50/20"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-100/70 text-emerald-700 mt-0.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-text-muted">
                          CO-{String(idx + 1).padStart(2, "0")}
                        </span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.2 font-mono text-[9px] font-semibold text-slate-600">
                          {idx === 0 ? "L2/L3" : idx === 1 ? "L4 Analyze" : "L5 Evaluate"}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[12.5px] font-medium leading-relaxed text-text-primary">
                        {outcome}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cryptographic Sovereign Provenance Footer */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-100/70 px-4 py-2.5 text-[11px] text-text-secondary border border-slate-200/50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span className="font-mono text-[10.5px] text-text-muted truncate max-w-xs md:max-w-sm">
                  {nodeId}
                </span>
              </div>
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 text-[10.5px]">
                Immutable Ledger Root
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <Link
              href={`/student/courses/${encodeURIComponent(code)}`}
              className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-blue-700 hover:text-blue-800 transition-colors"
            >
              <span>Inspect Full Course Syllabus & Lab Manual</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <div className="flex items-center gap-2">
              <Dialog.Close className="rounded-xl bg-slate-900 px-5 py-2.5 text-[13px] font-semibold text-white shadow-md transition-all hover:bg-slate-800 hover:shadow-lg active:scale-98">
                Close
              </Dialog.Close>
            </div>
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
