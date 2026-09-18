"use client";

import { motion } from "framer-motion";

const FOOTPRINTS = [
  { label: "Sem 1", x: "36%" },
  { label: "Sem 2", x: "44%" },
  { label: "Sem 3", x: "53%" },
  { label: "Sem 4", x: "61%" },
];

export function SemesterFootprints() {
  return (
    <>
      {FOOTPRINTS.map((f, i) => (
        <motion.span
          key={f.label}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 + i * 0.08, duration: 0.5 }}
          className="pointer-events-none absolute bottom-[2%] hidden rounded-full border border-border-subtle bg-white/85 px-3 py-1 text-[11px] font-semibold text-text-secondary shadow-sm md:block"
          style={{ left: f.x }}
        >
          {f.label}
        </motion.span>
      ))}
    </>
  );
}