"use client";

import { motion } from "framer-motion";
import { cn } from "../lib/cn";

export interface LoadingSkeletonProps {
  rows?: number;
  className?: string;
}

export function LoadingSkeleton({ rows = 3, className }: LoadingSkeletonProps) {
  return (
    <motion.div
      role="status"
      aria-label="Loading"
      className={cn("space-y-3", className)}
      animate={{ opacity: [0.45, 1, 0.45] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
    >
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="h-4 animate-pulse rounded-md bg-subtle" />
      ))}
      <span className="sr-only">Loading</span>
    </motion.div>
  );
}