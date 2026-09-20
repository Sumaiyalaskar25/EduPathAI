"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore, type IdentityMode } from "@/lib/store/session";

/**
 * Call at the top of any /student, /hei, or /gov page. Redirects to "/"
 * if there's no session, or the session's role doesn't match this
 * section (e.g. a learner token hitting a /hei page).
 */
export function useRequireRole(role: IdentityMode) {
    const router = useRouter();
    const session = useSessionStore((s) => s.session);

    useEffect(() => {
        if (!session || session.role !== role) {
            router.replace("/");
        }
    }, [session, role, router]);

    return session;
}
