"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Plus, ArrowRight } from "lucide-react";
import type { BridgeCourse } from "@/lib/view-models/gaps";

interface BridgeCourseCardProps {
  course: BridgeCourse;
  index: number;
}

export function BridgeCourseCard({ course, index }: BridgeCourseCardProps) {
  // course.id is the real bridge_id (see bridgesToCourseCards) — this
  // used to look the link up from a 3-entry provider→fake-id map, which
  // sent most real bridges to the wrong detail page.
  const detailHref = `/student/bridges/${course.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + index * 0.1, duration: 0.45 }}
      className="card-warm group flex flex-col p-5 transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
    >
      <Link href={detailHref} className="flex-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-text-muted">
          {course.provider}:
        </p>
        <h3 className="mt-1.5 text-[15px] font-bold leading-snug tracking-tight text-text-primary">
          {course.title}
        </h3>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10.5px] font-medium text-slate-700">
            Duration: {course.durationHours} Hours
          </span>
          {course.coverage && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10.5px] font-medium text-slate-700">
              {course.coverage}
            </span>
          )}
          {course.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-2.5 py-1 text-[10.5px] font-medium text-slate-700"
            >
              {tag}
            </span>
          ))}
        </div>
      </Link>

      <Link
        href={detailHref}
        className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-full bg-slate-900 px-4 py-2.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-slate-800"
      >
        <Plus className="h-3.5 w-3.5" />
        Add to Academic Plan
        <ArrowRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
      </Link>
    </motion.div>
  );
}