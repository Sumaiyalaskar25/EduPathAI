import type { AppRole } from "./roles";

export interface AuthSession {
  userId: string;
  role: AppRole;
  token: string;
  expiresAt?: string;
}

export type AuthStatus = "anonymous" | "authenticated" | "loading";

export interface AuthState {
  status: AuthStatus;
  session: AuthSession | null;
}

export const initialAuthState: AuthState = {
  status: "loading",
  session: null,
};

export const ANONYMOUS_AUTH_STATE: AuthState = {
  status: "anonymous",
  session: null,
};

export interface PortalAccess {
  app: "student" | "hei" | "government";
  allowedRole: AppRole;
}

export const PORTAL_ACCESS: Record<PortalAccess["app"], PortalAccess> = {
  student: { app: "student", allowedRole: "student" },
  hei: { app: "hei", allowedRole: "hei_reviewer" },
  government: { app: "government", allowedRole: "government_analyst" },
};

export function canAccessPortal(role: AppRole, app: PortalAccess["app"]): boolean {
  return role === PORTAL_ACCESS[app].allowedRole;
}