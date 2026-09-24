/**
 * web/lib/api/hooks.ts
 * ────────────────────────────────────────────────────────────────
 * React Query hooks. Pages import these instead of lib/constants/demo-*.
 * ────────────────────────────────────────────────────────────────
 */
"use client";

import { useMutation, useQuery, useQueries, useQueryClient } from "@tanstack/react-query";
import * as api from "./client";
import type { VerifyRequest, CourseDetail } from "./types";

/* ─────────── Auth ─────────── */

export function useAuthOverview() {
    return useQuery({
        queryKey: ["auth", "overview"],
        queryFn: () => api.getAuthOverview(),
        staleTime: 30_000,
        refetchInterval: 60_000,
    });
}

export function useVerifyIdentity() {
    return useMutation({
        mutationFn: (req: VerifyRequest) => api.verifyIdentity(req),
    });
}

/* ─────────── Pathway ─────────── */

export function useRunPathway() {
    return useMutation({
        mutationFn: ({ studentId, targetProgramme, institution }: { studentId: string; targetProgramme: string; institution: string }) =>
            api.requestPathway(studentId, targetProgramme, institution),
    });
}

export function useSubmitPathway() {
    return useMutation({
        mutationFn: ({ studentId, decisionId, pathwayMode }: { studentId: string; decisionId: string; pathwayMode: string }) =>
            api.submitPathway(studentId, decisionId, pathwayMode),
    });
}

export function useUpdatePlan() {
    return useMutation({
        mutationFn: ({ studentId, decisionId }: { studentId: string; decisionId: string }) =>
            api.updatePlan(studentId, decisionId),
    });
}

export function useAddToPlan() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ studentId, bridgeId }: { studentId: string; bridgeId: string }) => api.addToPlan(studentId, bridgeId),
        onSuccess: (_data, vars) => {
            qc.invalidateQueries({ queryKey: ["bridge", vars.bridgeId] });
        },
    });
}

export function useEnrollAllBridges() {
    return useMutation({
        mutationFn: ({ studentId, decisionId }: { studentId: string; decisionId: string }) =>
            api.enrollAllBridges(studentId, decisionId),
    });
}

/* ─────────── Audit ─────────── */

export function useAuditList(studentId?: string, limit = 50) {
    return useQuery({
        queryKey: ["audit-list", studentId, limit],
        queryFn: () => api.getAuditList(studentId, limit),
    });
}

export function useAudit(decisionId: string | undefined) {
    return useQuery({
        queryKey: ["audit", decisionId],
        queryFn: () => api.getAudit(decisionId as string),
        enabled: !!decisionId,
    });
}

export function useAuditHistory(decisionId: string | undefined) {
    return useQuery({
        queryKey: ["audit-history", decisionId],
        queryFn: () => api.getAuditHistory(decisionId as string),
        enabled: !!decisionId,
    });
}

export function useContestDecision() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ decisionId, reason }: { decisionId: string; reason: string }) => api.contestDecision(decisionId, reason),
        onSuccess: (_data, vars) => {
            qc.invalidateQueries({ queryKey: ["audit-history", vars.decisionId] });
            qc.invalidateQueries({ queryKey: ["audit", vars.decisionId] });
        },
    });
}

export function useReplayDecision(decisionId: string | undefined) {
    return useQuery({
        queryKey: ["audit-replay", decisionId],
        queryFn: () => api.replayDecision(decisionId as string),
        enabled: !!decisionId,
    });
}

/* ─────────── Student ─────────── */

export function useStudentProfile(externalRef: string | undefined) {
    return useQuery({
        queryKey: ["student-profile", externalRef],
        queryFn: () => api.getStudentProfile(externalRef as string),
        enabled: !!externalRef,
    });
}

/* ─────────── Courses / Bridges ─────────── */

export function useCourse(code: string | undefined) {
    return useQuery({
        queryKey: ["course", code],
        queryFn: () => api.getCourse(code as string),
        enabled: !!code,
    });
}

/**
 * Batch-fetches course details for a set of codes (e.g. every course
 * referenced across a pathway's terms) and returns them as a code →
 * CourseDetail map, so display components can do a pure lookup instead
 * of fabricating title/credits/modality. Shares its cache with
 * useCourse — opening a course tile from a pathway won't re-fetch it.
 */
export function useCourseCatalog(codes: string[]) {
    const unique = Array.from(new Set(codes));
    const results = useQueries({
        queries: unique.map((code) => ({
            queryKey: ["course", code],
            queryFn: () => api.getCourse(code),
        })),
    });

    const map = new Map<string, CourseDetail>();
    results.forEach((r, i) => {
        if (r.data) map.set(unique[i], r.data);
    });

    return {
        data: map,
        isLoading: results.some((r) => r.isLoading),
        isError: results.some((r) => r.isError),
    };
}

export function useBridge(bridgeId: string | undefined) {
    return useQuery({
        queryKey: ["bridge", bridgeId],
        queryFn: () => api.getBridge(bridgeId as string),
        enabled: !!bridgeId,
    });
}

/* ─────────── HEI ─────────── */

export function useHeiQueue(institution: string | undefined) {
    return useQuery({
        queryKey: ["hei-queue", institution],
        queryFn: () => api.getHeiQueue(institution as string),
        enabled: !!institution,
    });
}

export function useHeiApproved(institution: string | undefined) {
    return useQuery({
        queryKey: ["hei-approved", institution],
        queryFn: () => api.getHeiApproved(institution as string),
        enabled: !!institution,
    });
}

export function useHeiInstitutions() {
    return useQuery({
        queryKey: ["hei-institutions"],
        queryFn: () => api.getHeiInstitutions(),
    });
}

export function useDecisionReview(institution: string | undefined) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ decisionId, decision, notes }: { decisionId: string; decision: "approve" | "reject"; notes?: string }) =>
            decision === "approve" ? api.approveDecision(decisionId, notes) : api.rejectDecision(decisionId, notes),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["hei-queue", institution] });
            qc.invalidateQueries({ queryKey: ["hei-approved", institution] });
        },
    });
}

/* ─────────── Gov ─────────── */

export function useGovAggregate() {
    return useQuery({
        queryKey: ["gov-aggregate"],
        queryFn: () => api.getGovAggregate(),
    });
}

export function useGovMobility() {
    return useQuery({
        queryKey: ["gov-mobility"],
        queryFn: () => api.getGovMobility(),
    });
}

export function useGovPolicy(institution?: string, programme?: string) {
    return useQuery({
        queryKey: ["gov-policy", institution, programme],
        queryFn: () => api.getGovPolicy(institution, programme),
    });
}

export function useUpdateGovPolicy() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ institution, programme, policyKey, policyValue }: {
            institution: string; programme: string; policyKey: string; policyValue: Record<string, unknown>;
        }) => api.updateGovPolicy(institution, programme, policyKey, policyValue),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["gov-policy"] });
        },
    });
}
