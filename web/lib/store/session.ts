/**
 * web/lib/store/session.ts
 * ────────────────────────────────────────────────────────────────
 * Client-side session state. Populated by POST /v1/auth/verify
 * (see components/auth/DigiLockerAccess.tsx), read by lib/api/client.ts
 * to attach the Authorization header, and by every page to know who's
 * signed in and in which of the three roles (learner / bos / ministry).
 * ────────────────────────────────────────────────────────────────
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type IdentityMode = "learner" | "bos" | "ministry";

export interface Session {
    token: string;
    role: IdentityMode;
    externalRef: string;
    displayName: string;
    institution?: string;
    programme?: string;
    targetInstitution?: string;
    targetProgramme?: string;
}

interface SessionState {
    session: Session | null;
    setSession: (session: Session) => void;
    setTargetInstitution: (targetInstitution: string) => void;
    setTargetDestination: (targetInstitution: string, targetProgramme?: string) => void;
    clearSession: () => void;
}

export const useSessionStore = create<SessionState>()(
    persist(
        (set) => ({
            session: null,
            setSession: (session) => set({ session }),
            setTargetInstitution: (targetInstitution) =>
                set((state) =>
                    state.session
                        ? { session: { ...state.session, targetInstitution } }
                        : state
                ),
            setTargetDestination: (targetInstitution, targetProgramme) =>
                set((state) =>
                    state.session
                        ? {
                              session: {
                                  ...state.session,
                                  targetInstitution,
                                  targetProgramme: targetProgramme ?? state.session.targetProgramme,
                              },
                          }
                        : state
                ),
            clearSession: () => set({ session: null }),
        }),
        { name: "edupathai-session" }
    )
);

/** Non-hook accessor for use outside React components (lib/api/client.ts). */
export function getCurrentSession(): Session | null {
    return useSessionStore.getState().session;
}
