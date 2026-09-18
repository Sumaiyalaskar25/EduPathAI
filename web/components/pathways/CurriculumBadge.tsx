"use client";

import { ChevronDown } from "lucide-react";

interface CurriculumBadgeProps {
  institution: string;
  version: string;
}

export function CurriculumBadge({ institution, version }: CurriculumBadgeProps) {
  return (
    <button className="hidden items-center gap-1.5 rounded-full border border-border-subtle bg-white px-3.5 py-2 text-[11.5px] font-medium text-text-secondary transition-colors hover:bg-white/70 md:inline-flex">
      <span className="font-semibold text-text-primary">{institution}</span>
      <span className="text-text-muted">|</span>
      <span>Curriculum {version}</span>
      <ChevronDown className="h-3.5 w-3.5 text-text-muted" />
    </button>
  );
}