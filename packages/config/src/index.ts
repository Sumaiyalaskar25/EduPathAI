import type { AppRole } from "@edupathai/auth";
import { APP_ROLES } from "@edupathai/auth";

export type AppId = "student" | "hei" | "government";

export interface AppDefinition {
  id: AppId;
  packageName: string;
  name: string;
  port: number;
  role: AppRole;
}

export const APPS: Record<AppId, AppDefinition> = {
  student: {
    id: "student",
    packageName: "@edupathai/student",
    name: "EduPathAI Student Portal",
    port: 3000,
    role: "student",
  },
  hei: {
    id: "hei",
    packageName: "@edupathai/hei",
    name: "EduPathAI HEI Review Portal",
    port: 3001,
    role: "hei_reviewer",
  },
  government: {
    id: "government",
    packageName: "@edupathai/government",
    name: "EduPathAI Government Dashboard",
    port: 3002,
    role: "government_analyst",
  },
};

export const APP_IDS = Object.keys(APPS) as AppId[];

export const SUPPORTED_ROLES: readonly AppRole[] = APP_ROLES;

export const API = {
  defaultBaseUrl: "http://127.0.0.1:8000",
  healthPath: "/health",
} as const;

export function validateSupportedRole(role: unknown): role is AppRole {
  return (SUPPORTED_ROLES as readonly unknown[]).includes(role);
}