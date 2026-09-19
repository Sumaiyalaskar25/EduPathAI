/**
 * web/lib/api/client.ts
 * ────────────────────────────────────────────────────────────────
 * Typed fetch helpers. All backend calls go through here.
 *
 * Swap from demo → live backend by flipping NEXT_PUBLIC_API_URL.
 * When the API is not reachable, these throw a clean Error that
 * pages can catch and render fallback UI for.
 * ────────────────────────────────────────────────────────────────
 */

import type {
  PathwayResponse,
  PathwayRequest,
  AuditRecord,
} from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    throw new Error(
      `API ${path} failed: ${res.status} ${res.statusText}`
    );
  }
  return (await res.json()) as T;
}

/**
 * POST /v1/pathway/request
 * Main entrypoint — runs the full decision pipeline for a student.
 */
export async function requestPathway(
  studentId: string,
  targetProgramme: string,
  institution: string
): Promise<PathwayResponse> {
  const body: PathwayRequest = {
    student_id: studentId,
    target_programme: targetProgramme,
    institution,
  };
  return request<PathwayResponse>("/v1/pathway/request", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * GET /v1/audit/{decisionId}
 * Fetch a single decision's full audit record for replay.
 */
export async function getAudit(
  decisionId: string
): Promise<AuditRecord> {
  return request<AuditRecord>(`/v1/audit/${decisionId}`);
}

/**
 * GET /v1/health
 * Cheap readiness check.
 */
export async function getHealth(): Promise<{ status: string }> {
  return request<{ status: string }>("/v1/health");
}