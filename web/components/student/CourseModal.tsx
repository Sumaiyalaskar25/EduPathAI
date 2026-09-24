"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { BookOpen, Award, CheckCircle2, X, Sparkles, Network } from "lucide-react";

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
  if (!course) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md transition-opacity" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[95vw] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xl focus:outline-none md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 shadow-sm">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <span className="font-mono text-[12px] font-bold uppercase tracking-wider text-blue-700">
                  {course.code}
                </span>
                <Dialog.Title className="font-display text-[20px] font-bold text-text-primary">
                  {course.title || course.code}
                </Dialog.Title>
              </div>
            </div>
            <Dialog.Close className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-800 border border-emerald-200">
              Verified in National Graph v2
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700">
              {course.credits ?? 4} NCrF Credits
            </span>
            {course.bloomLevel && (
              <span className="rounded-full bg-purple-50 px-3 py-1 text-[11px] font-semibold text-purple-700 border border-purple-200">
                Bloom {course.bloomLevel}
              </span>
            )}
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <div className="flex items-center gap-2 text-text-muted">
                <Award className="h-4 w-4 text-emerald-600" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Institution Anchor</span>
              </div>
              <p className="mt-1 text-[13px] font-medium text-text-primary">
                {course.institution || "IIT Kanpur (National Reference Syllabus)"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-text-muted">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Learning Competency Mappings</span>
              </div>
              <ul className="mt-3 space-y-2 text-[12.5px] text-text-secondary">
                {(course.outcomes && course.outcomes.length > 0
                  ? course.outcomes
                  : [
                      "Apply procedural and object-oriented paradigms in systems software",
                      "Design asymptotic complexity bounds for recursive search structures",
                      "Analyze memory management and pointers in bare-metal architectures",
                    ]
                ).map((outcome, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Dialog.Close className="rounded-xl bg-[rgb(26_42_82)] px-5 py-2.5 text-[13px] font-semibold text-white shadow-md transition-colors hover:bg-[rgb(36_56_105)]">
              Close
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
