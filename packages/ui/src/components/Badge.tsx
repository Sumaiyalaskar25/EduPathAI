import type { HTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        neutral: "border-subtle bg-surface text-secondary",
        brand: "border-brand-100 bg-brand-50 text-brand-700",
        direct: "border-emerald-200 bg-direct-bg text-emerald-700",
        bridge: "border-amber-200 bg-bridge-bg text-amber-700",
        missing: "border-rose-200 bg-missing-bg text-rose-700",
        review: "border-slate-200 bg-review-bg text-slate-700",
        conflict: "border-fuchsia-200 bg-conflict-bg text-fuchsia-700",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  icon?: ReactNode;
}

export function Badge({
  className,
  variant,
  icon,
  children,
  ...props
}: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {icon}
      {children}
    </span>
  );
}

export { badgeVariants };