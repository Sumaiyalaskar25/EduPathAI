"use client";

import { motion } from "framer-motion";
import type { SemesterColumn as SemType } from "@/lib/constants/demo-pathways";
import { CourseTile } from "./CourseTile";

interface SemesterColumnProps {
  semester: SemType;
  index: number;
}

export function SemesterColumn({ semester, index }: SemesterColumnProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.08, duration: 0.5 }}
      className="flex min-w-0 flex-1 flex-col"
    >
      {/* Header */}
      <div className="mb-3">
        <h3 className="text-[15px] font-bold leading-tight tracking-tight text-text-primary">
          {semester.label}
        </h3>
        <p className="mt-0.5 text-[12px] font-medium text-text-muted">
          {semester.sublabel}
        </p>
      </div>

      {/* Course tiles stack */}
      <div className="flex flex-col gap-2.5">
        {semester.courses.map((course) => (
          <CourseTile
            key={course.code}
            code={course.code}
            title={course.title}
            credits={course.credits}
            tag={course.tag}
          />
        ))}
      </div>
    </motion.div>
  );
}