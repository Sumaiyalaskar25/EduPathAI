import type { CSSProperties, ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  GitMerge,
  ShieldAlert,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import type { RecognitionStatus } from "@edupathai/api-types";
import { Badge, type BadgeProps } from "./Badge";
import { cn } from "../lib/cn";

const STATUS_META: Record<
  RecognitionStatus,
  { variant: NonNullable<BadgeProps["variant"]>; label: string; icon: LucideIcon }
> = {
  DIRECT: { variant: "direct", label: "Direct", icon: CheckCircle2 },
  BRIDGE: { variant: "bridge", label: "Bridge", icon: GitMerge },
  MISSING: { variant: "missing", label: "Missing", icon: XCircle },
  REVIEW: { variant: "review", label: "Review", icon: AlertTriangle },
  POLICY_CONFLICT: {
    variant: "conflict",
    label: "Policy Conflict",
    icon: ShieldAlert,
  },
};

export interface StatusBadgeProps {
  status: RecognitionStatus;
  className?: string;
  style?: CSSProperties;
}

export function StatusBadge({ status, className, style }: StatusBadgeProps) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  return (
    <Badge variant={meta.variant} className={cn(className)} style={style}>
      <Icon className="h-3 w-3" />
      {meta.label}
    </Badge>
  );
}

export function RecognitionStatusLegend(): ReactNode {
  const statuses = Object.keys(STATUS_META) as RecognitionStatus[];
  return (
    <div className="flex flex-wrap items-center gap-2">
      {statuses.map((status) => (
        <StatusBadge key={status} status={status} />
      ))}
    </div>
  );
}

export { STATUS_META };