"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Calculator, ArrowRight, CheckCircle2, Sparkles, X } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreditSimulatorModal({ open, onOpenChange }: Props) {
  const [completedCredits, setCompletedCredits] = useState(64);
  const [discipline, setDiscipline] = useState("Computer Science & Engineering");

  const estimatedDirect = Math.round(completedCredits * 0.78);
  const estimatedBridge = Math.round(completedCredits * 0.15);
  const estimatedTransferred = estimatedDirect + estimatedBridge;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm transition-opacity" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl focus:outline-none md:p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <Calculator className="h-5 w-5" />
              </div>
              <div>
                <Dialog.Title className="font-display text-[20px] font-bold text-text-primary">
                  Academic Credit Simulator
                </Dialog.Title>
                <Dialog.Description className="text-[12px] text-text-secondary">
                  Estimate credit preservation and bridge course requirements
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className="text-[11.5px] font-bold uppercase tracking-wider text-text-muted">
                Completed University Credits: {completedCredits}
              </label>
              <input
                type="range"
                min={20}
                max={160}
                step={4}
                value={completedCredits}
                onChange={(e) => setCompletedCredits(Number(e.target.value))}
                className="mt-2 w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-text-muted">
                <span>Year 1 (40)</span>
                <span>Year 2 (80)</span>
                <span>Year 3 (120)</span>
                <span>Year 4 (160)</span>
              </div>
            </div>

            <div>
              <label className="text-[11.5px] font-bold uppercase tracking-wider text-text-muted">
                Target Discipline Family
              </label>
              <select
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50/80 p-3 text-[13.5px] font-medium outline-none focus:border-emerald-500 focus:bg-white"
              >
                <option>Computer Science & Engineering</option>
                <option>Electronics & Communication</option>
                <option>Mechanical & Automation</option>
                <option>Biotechnology & Life Sciences</option>
                <option>Data Science & Artificial Intelligence</option>
              </select>
            </div>

            {/* Results Grid */}
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Simulated Recognition Breakdown
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-white p-3 shadow-xs">
                  <p className="text-[11px] font-medium text-text-muted">Direct Transfer</p>
                  <p className="font-display text-[20px] font-bold text-emerald-700">{estimatedDirect}</p>
                  <p className="text-[10px] text-text-muted">Credits (78%)</p>
                </div>
                <div className="rounded-xl bg-white p-3 shadow-xs">
                  <p className="text-[11px] font-medium text-text-muted">Bridge Mapped</p>
                  <p className="font-display text-[20px] font-bold text-amber-600">{estimatedBridge}</p>
                  <p className="text-[10px] text-text-muted">SWAYAM / NPTEL</p>
                </div>
                <div className="rounded-xl bg-white p-3 shadow-xs">
                  <p className="text-[11px] font-medium text-text-muted">Total Recognized</p>
                  <p className="font-display text-[20px] font-bold text-[rgb(26_42_82)]">{estimatedTransferred}</p>
                  <p className="text-[10px] text-text-muted">Of {completedCredits} Credits</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-3 text-[11.5px] text-text-muted">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              National Curriculum Graph v2 Calibrated
            </span>
            <Dialog.Close className="rounded-xl bg-[rgb(26_42_82)] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[rgb(34_54_102)]">
              Got it
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
