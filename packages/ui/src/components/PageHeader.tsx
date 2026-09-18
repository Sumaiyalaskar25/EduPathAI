import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-b border-subtle pb-6 md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div>
        {eyebrow && (
          <p className="text-xs font-medium uppercase tracking-wider text-brand-600">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 font-display text-3xl font-semibold text-primary">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-secondary">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}