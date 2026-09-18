export const APP_ROLES = [
  "student",
  "hei_reviewer",
  "government_analyst",
] as const;

export type AppRole = (typeof APP_ROLES)[number];

export interface RoleDefinition {
  role: AppRole;
  label: string;
  description: string;
}

export const ROLE_DEFINITIONS: Record<AppRole, RoleDefinition> = {
  student: {
    role: "student",
    label: "Student",
    description: "Learner planning an academic pathway.",
  },
  hei_reviewer: {
    role: "hei_reviewer",
    label: "HEI Reviewer",
    description: "Board of Studies / equivalence committee reviewer.",
  },
  government_analyst: {
    role: "government_analyst",
    label: "Government Analyst",
    description: "UGC / MoE mobility and friction analyst.",
  },
};

export const ROLE_LABELS = Object.fromEntries(
  APP_ROLES.map((role) => [role, ROLE_DEFINITIONS[role].label]),
) as Record<AppRole, string>;

export function isAppRole(value: unknown): value is AppRole {
  return (
    typeof value === "string" &&
    (APP_ROLES as readonly string[]).includes(value)
  );
}

export function hasAnyRole(
  roles: readonly AppRole[],
  required: readonly AppRole[],
): boolean {
  return required.some((role) => roles.includes(role));
}

export function hasRole(
  roles: readonly AppRole[],
  required: AppRole,
): boolean {
  return roles.includes(required);
}