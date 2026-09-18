"use client";

import Link from "next/link";
import { cn } from "@/lib/utils/cn";

interface CourseTileProps {
  code: string;
  title: string;
  credits: number;
  tag: "Theory" | "Lab" | "Theory & Lab";
}

const TAG_STYLES: Record<string, string> = {
  Theory: "bg-slate-100 text-slate-700",
  Lab: "bg-slate-100 text-slate-700",
  "Theory & Lab": "bg-slate-100 text-slate-700",
};

/** Map display code to a demo course detail ID (lowercase, dash-separated). */
function codeToId(code: string): string {
  return code.toLowerCase().replace(/\s+/g, "-");
}

export function CourseTile({ code, title, credits, tag }: CourseTileProps) {
  const href = `/student/courses/${codeToId(code)}`;

  return (
    <Link
      href={href}
      className="group relative block rounded-2xl border border-border-subtle bg-white px-4 py-3.5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-[13.5px] font-semibold leading-snug text-text-primary">
          {title}
        </h4>
        <span
          className={cn(
            "mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
            TAG_STYLES[tag]
          )}
        >
          {tag}
        </span>
      </div>
      <p className="mt-1 text-[12px] font-medium text-text-muted">
        {credits} Credits
      </p>
    </Link>
  );
}