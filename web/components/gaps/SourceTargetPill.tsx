import { ArrowRight, Building2, ShieldCheck, Sparkles } from "lucide-react";

interface SourceTargetPillProps {
  source: string;
  target: string;
  programme?: string;
  alignmentPct?: number;
}

export function SourceTargetPill({
  source,
  target,
  programme = "B.Tech Computer Science & Engineering",
  alignmentPct = 33,
}: SourceTargetPillProps) {
  return (
    <div className="glass-strong rounded-3xl p-5 md:p-6 border border-white/80 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800 border border-emerald-200">
            Curriculum Reconciliation Matrix
          </span>
          <span className="font-mono text-[11px] text-slate-500">
            NCrF Level 6.0 Aligned
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[15px] font-bold text-text-primary">
          <span className="text-slate-800">{source}</span>
          <ArrowRight className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="text-emerald-900 bg-emerald-50/80 px-2 py-0.5 rounded-lg border border-emerald-200/60">
            {target}
          </span>
          <span className="text-text-muted font-normal text-[13px]">· {programme}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="rounded-2xl bg-white/80 px-3.5 py-2 border border-slate-200/80 shadow-sm flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold text-[12px]">
            {alignmentPct}%
          </div>
          <div className="text-[11px]">
            <span className="font-bold text-text-primary block">Concordance</span>
            <span className="text-text-muted">Target syllabus overlap</span>
          </div>
        </div>
        <div className="rounded-2xl bg-white/80 px-3.5 py-2 border border-slate-200/80 shadow-sm flex items-center gap-2 text-[11.5px] font-semibold text-slate-700">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>BoS Validated</span>
        </div>
      </div>
    </div>
  );
}