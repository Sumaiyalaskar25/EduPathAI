"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { BookOpen, Layers, CheckCircle, ShieldCheck, X } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NCRF_LEVELS = [
  { level: "NCrF Level 4.5", cert: "UG Certificate", year: "Year 1 (40 Credits)", exit: "Permitted Exit with Certificate" },
  { level: "NCrF Level 5.0", cert: "UG Diploma", year: "Year 2 (80 Credits)", exit: "Permitted Exit with Diploma" },
  { level: "NCrF Level 5.5", cert: "Bachelor's Degree", year: "Year 3 (120 Credits)", exit: "3-Year Multi-Disciplinary Degree" },
  { level: "NCrF Level 6.0", cert: "Bachelor's (Hons / Research)", year: "Year 4 (160 Credits)", exit: "Direct Entry to PhD / Master's" },
];

const BLOOM_LEVELS = [
  { code: "L1", name: "Remember", desc: "Recall terminology, formulas, principles" },
  { code: "L2", name: "Understand", desc: "Explain models, contrast paradigms" },
  { code: "L3", name: "Apply", desc: "Implement algorithms, solve domain problems" },
  { code: "L4", name: "Analyze", desc: "Deconstruct systems, evaluate complexity" },
  { code: "L5", name: "Evaluate", desc: "Audit correctness, judge trade-offs" },
  { code: "L6", name: "Create", desc: "Design architectures, formulate novel models" },
];

export function FrameworkModal({ open, onOpenChange }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm transition-opacity" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl focus:outline-none md:p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-50 text-purple-700">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <Dialog.Title className="font-display text-[20px] font-bold text-text-primary">
                  National Credit Framework (NCrF)
                </Dialog.Title>
                <Dialog.Description className="text-[12px] text-text-secondary">
                  UGC Multiple Entry/Exit &amp; Bloom's Taxonomy Alignment Matrix
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          {/* NCrF Levels */}
          <div className="mt-5">
            <h3 className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-text-muted">
              <Layers className="h-3.5 w-3.5 text-purple-600" />
              NCrF Higher Education Mobility Ladder
            </h3>
            <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {NCRF_LEVELS.map((lvl, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-800 text-[12px]">{lvl.level}</span>
                    <span className="text-[10px] font-semibold text-slate-500">{lvl.year}</span>
                  </div>
                  <p className="mt-1 font-semibold text-text-primary text-[13px]">{lvl.cert}</p>
                  <p className="text-[11px] text-text-muted">{lvl.exit}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bloom's Levels */}
          <div className="mt-5">
            <h3 className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-text-muted">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
              Bloom's Revised Taxonomy (62,400 Atomic Competencies)
            </h3>
            <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {BLOOM_LEVELS.map((b) => (
                <div key={b.code} className="rounded-xl border border-slate-100 bg-white p-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="rounded bg-emerald-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-800">
                      {b.code}
                    </span>
                    <span className="font-bold text-[12px] text-text-primary">{b.name}</span>
                  </div>
                  <p className="mt-1 text-[10.5px] leading-tight text-text-muted">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-3 text-[11.5px] text-text-muted">
            <span className="flex items-center gap-1 font-medium text-purple-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              UGC &amp; AICTE NCrF Compliant (2024–2026)
            </span>
            <span>Deterministic Rules + Semantic Matcher</span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
