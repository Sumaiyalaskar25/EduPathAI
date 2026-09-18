import { ArrowRight } from "lucide-react";

interface SourceTargetPillProps {
  source: string;
  target: string;
}

export function SourceTargetPill({ source, target }: SourceTargetPillProps) {
  return (
    <div className="glass flex flex-wrap items-center gap-2 rounded-full px-5 py-3 text-[13px]">
      <span className="font-medium text-text-secondary">Source:</span>
      <span className="font-semibold text-text-primary">{source}</span>
      <ArrowRight className="mx-1 h-4 w-4 text-text-muted" />
      <span className="font-medium text-text-secondary">Target:</span>
      <span className="font-semibold text-text-primary">{target}</span>
    </div>
  );
}