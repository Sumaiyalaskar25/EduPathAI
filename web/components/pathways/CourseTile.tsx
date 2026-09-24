"use client";

import Link from "next/link";
import { cn } from "@/lib/utils/cn";

interface CourseTileProps {
  code: string;
  title: string;
  credits: number | null;
  tag: string;
}

const TAG_STYLES: Record<string, string> = {
  Theory: "bg-slate-100 text-slate-700",
  Lab: "bg-sky-100 text-sky-700",
  "Theory & Lab": "bg-amber-100 text-amber-800",
  Unknown: "bg-slate-50 text-slate-400",
};

export function CourseTile({ code, title, credits, tag }: CourseTileProps) {
  // Course codes (e.g. "CS-401") are the real primary key the backend
  // looks up in GET /v1/courses/{code} — lowercasing/reformatting them
  // here used to silently 404 every real course link.
  const href = `/student/courses/${encodeURIComponent(code)}`;

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
        {credits !== null ? `${credits} Credits` : "Credits unknown"}
      </p>
    </Link>
  );
}