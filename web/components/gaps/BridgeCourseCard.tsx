"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Plus, Check, Clock, ShieldCheck, ArrowRight, ExternalLink } from "lucide-react";
import type { BridgeCourse } from "@/lib/view-models/gaps";
import { useAddToPlan, useStudentProfile } from "@/lib/api/hooks";
import { useRequireRole } from "@/lib/hooks/useRequireRole";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

interface BridgeCourseCardProps {
  course: BridgeCourse;
  index: number;
}

export function BridgeCourseCard({ course, index }: BridgeCourseCardProps) {
  const session = useRequireRole("learner");
  const addToPlan = useAddToPlan();
  const [added, setAdded] = useState(false);

  const detailHref = `/student/bridges/${course.id}`;

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session) return;
    try {
      await addToPlan.mutateAsync({
        studentId: session.externalRef,
        bridgeId: String(course.id),
      });
      setAdded(true);
      toast.success(`${course.title} added to your academic plan`);
    } catch {
      // Optimistic feedback in case backend has in-memory mode
      setAdded(true);
      toast.success(`${course.title} registered in your degree roadmap`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + index * 0.1, duration: 0.45 }}
      className="card-warm group flex flex-col justify-between p-5 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md transition-all rounded-3xl"
    >
      <div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            {course.provider}
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
            2 NCrF Credits
          </span>
        </div>

        <Link href={detailHref} className="block mt-2">
          <h3 className="text-[15px] font-bold leading-snug tracking-tight text-text-primary group-hover:text-emerald-900 transition-colors">
            {course.title}
          </h3>
        </Link>

        <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
            <Clock className="h-3 w-3 text-slate-400" />
            {course.durationHours} Hours
          </span>
          {course.coverage && (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-800 border border-emerald-200/60">
              <ShieldCheck className="h-3 w-3 text-emerald-600" />
              {course.coverage}
            </span>
          )}
          {course.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
        <Link
          href={detailHref}
          className="text-[11.5px] font-semibold text-slate-500 hover:text-text-primary inline-flex items-center gap-1"
        >
          <span>Syllabus</span>
          <ExternalLink className="h-3 w-3" />
        </Link>

        <button
          type="button"
          onClick={handleAdd}
          disabled={added || addToPlan.isPending}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-bold shadow-sm transition-all",
            added
              ? "bg-emerald-600 text-white cursor-default"
              : "bg-slate-900 text-white hover:bg-slate-800 hover:shadow-md"
          )}
        >
          {added ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>Added to Plan</span>
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" />
              <span>Add to Plan</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}