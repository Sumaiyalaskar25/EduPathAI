import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  padded?: boolean;
}

export function Card({
  className,
  title,
  description,
  icon,
  actions,
  padded = true,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-subtle bg-surface shadow-sm",
        padded && "p-6",
        className,
      )}
      {...props}
    >
      {(title || actions) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {icon}
            <div>
              {title && (
                <h3 className="font-display text-base font-semibold text-primary">
                  {title}
                </h3>
              )}
              {description && (
                <p className="mt-1 text-sm text-secondary">{description}</p>
              )}
            </div>
          </div>
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}