/**
 * web/lib/api/client.ts
 * ────────────────────────────────────────────────────────────────
 * Typed fetch helpers. All backend calls go through here.
 *
 * Every call attaches the signed session token (lib/store/session.ts)
 * as a Bearer header when one exists. When the API is not reachable,
 * or returns a non-2xx status, these throw ApiError so pages can
 * catch it and render fallback/error UI.
 * ────────────────────────────────────────────────────────────────
 */

import type {
  PathwayResponse,
  PathwayRequest,
  AuditRecord,
  VerifyRequest,
  VerifyResponse,
  StudentProfile,
  CourseDetail,
  BridgeDetail,
  HeiQueueResponse,
  HeiApprovedResponse,
  HeiInstitutionsResponse,
  GovAggregate,
  GovMobility,
  GovPolicyResponse,
  PolicyOverride,
  AuthOverviewResponse,
} from "./types";
import { getCurrentSession } from "@/lib/store/session";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  constructor(path: string, status: number, statusText: string) {
    super(`API ${path} failed: ${status} ${statusText}`);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const session = getCurrentSession();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    throw new ApiError(path, res.status, res.statusText);
  }
  return (await res.json()) as T;
}

async function requestBlob(path: string, init?: RequestInit): Promise<Blob> {
  const session = getCurrentSession();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    throw new ApiError(path, res.status, res.statusText);
  }
  return res.blob();
}

/** Triggers a browser download for a fetched blob. */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* ─────────── Auth ─────────── */

export async function getAuthOverview(): Promise<AuthOverviewResponse> {
  return request<AuthOverviewResponse>("/v1/auth/overview");
}

export async function verifyIdentity(req: VerifyRequest): Promise<VerifyResponse> {
  return request<VerifyResponse>("/v1/auth/verify", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

/* ─────────── Pathway pipeline ─────────── */

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

export async function submitPathway(
  studentId: string,
  decisionId: string,
  pathwayMode: string
): Promise<{ status: string }> {
  return request(`/v1/pathway/submit`, {
    method: "POST",
    body: JSON.stringify({ student_id: studentId, decision_id: decisionId, pathway_mode: pathwayMode }),
  });
}

export async function updatePlan(studentId: string, decisionId: string): Promise<{ status: string }> {
  return request(`/v1/plan/update`, {
    method: "POST",
    body: JSON.stringify({ student_id: studentId, decision_id: decisionId }),
  });
}

export async function addToPlan(studentId: string, bridgeId: string): Promise<{ status: string }> {
  return request(`/v1/plan/add`, {
    method: "POST",
    body: JSON.stringify({ student_id: studentId, bridge_id: bridgeId }),
  });
}

export async function enrollAllBridges(studentId: string, decisionId: string): Promise<{ status: string; count: number }> {
  return request(`/v1/plan/enroll-all`, {
    method: "POST",
    body: JSON.stringify({ student_id: studentId, decision_id: decisionId }),
  });
}

/* ─────────── Audit ─────────── */

export async function getAuditList(studentId?: string, limit = 50): Promise<AuditRecord[]> {
  const qs = new URLSearchParams({ limit: String(limit), ...(studentId ? { student_id: studentId } : {}) });
  return request<AuditRecord[]>(`/v1/audit/list?${qs}`);
}

export async function getAudit(decisionId: string): Promise<AuditRecord> {
  return request<AuditRecord>(`/v1/audit/${decisionId}`);
}

export async function getAuditHistory(decisionId: string): Promise<AuditRecord[]> {
  return request<AuditRecord[]>(`/v1/audit/${decisionId}/history`);
}

export async function replayDecision(decisionId: string): Promise<{ decision_id: string; bundle: import("./types").DecisionBundle | null; history: AuditRecord[] }> {
  return request(`/v1/audit/${decisionId}/replay`);
}

export async function contestDecision(decisionId: string, reason: string): Promise<AuditRecord> {
  return request<AuditRecord>(`/v1/audit/${decisionId}/contest`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export async function downloadAuditPdf(decisionId: string): Promise<Blob> {
  return requestBlob(`/v1/audit/${decisionId}/pdf`);
}

/* ─────────── Student ─────────── */

export async function getStudentProfile(externalRef: string): Promise<StudentProfile> {
  return request<StudentProfile>(`/v1/student/${externalRef}`);
}

export async function downloadStudentExport(externalRef: string): Promise<Blob> {
  return requestBlob(`/v1/student/${externalRef}/export`);
}

export async function updateStudentTarget(
  externalRef: string,
  targetInstitution: string,
  targetProgramme?: string
): Promise<{ status: string; target_institution: string }> {
  return request(`/v1/student/${encodeURIComponent(externalRef)}/target`, {
    method: "PATCH",
    body: JSON.stringify({
      target_institution: targetInstitution,
      ...(targetProgramme ? { target_programme: targetProgramme } : {}),
    }),
  });
}

/* ─────────── Courses / Bridges ─────────── */

export async function getCourse(code: string): Promise<CourseDetail> {
  return request<CourseDetail>(`/v1/courses/${encodeURIComponent(code)}`);
}

export async function getBridge(bridgeId: string): Promise<BridgeDetail> {
  return request<BridgeDetail>(`/v1/bridges/${bridgeId}`);
}

/* ─────────── HEI ─────────── */

export async function getHeiQueue(institution: string): Promise<HeiQueueResponse> {
  return request<HeiQueueResponse>(`/v1/hei/${encodeURIComponent(institution)}/queue`);
}

export async function getHeiApproved(institution: string): Promise<HeiApprovedResponse> {
  return request<HeiApprovedResponse>(`/v1/hei/${encodeURIComponent(institution)}/approved`);
}

export async function getHeiInstitutions(): Promise<HeiInstitutionsResponse> {
  return request<HeiInstitutionsResponse>(`/v1/hei/institutions`);
}

export async function approveDecision(decisionId: string, notes = ""): Promise<AuditRecord> {
  return request<AuditRecord>(`/v1/hei/decision/${decisionId}/approve`, {
    method: "POST",
    body: JSON.stringify({ notes }),
  });
}

export async function rejectDecision(decisionId: string, notes = ""): Promise<AuditRecord> {
  return request<AuditRecord>(`/v1/hei/decision/${decisionId}/reject`, {
    method: "POST",
    body: JSON.stringify({ notes }),
  });
}

/* ─────────── Gov ─────────── */

export async function getGovAggregate(): Promise<GovAggregate> {
  return request<GovAggregate>(`/v1/gov/aggregate`);
}

export async function getGovMobility(): Promise<GovMobility> {
  return request<GovMobility>(`/v1/gov/mobility`);
}

export async function downloadGovMobilityExport(): Promise<Blob> {
  return requestBlob(`/v1/gov/mobility/export`);
}

export async function getGovPolicy(institution?: string, programme?: string): Promise<GovPolicyResponse> {
  const qs = new URLSearchParams({
    ...(institution ? { institution } : {}),
    ...(programme ? { programme } : {}),
  });
  return request<GovPolicyResponse>(`/v1/gov/policy?${qs}`);
}

export async function updateGovPolicy(
  institution: string,
  programme: string,
  policyKey: string,
  policyValue: Record<string, unknown>
): Promise<PolicyOverride> {
  return request<PolicyOverride>(`/v1/gov/policy`, {
    method: "POST",
    body: JSON.stringify({ institution, programme, policy_key: policyKey, policy_value: policyValue }),
  });
}

export async function deleteGovPolicy(overrideId: string): Promise<{ status: string; id: string }> {
  return request<{ status: string; id: string }>(`/v1/gov/policy/${encodeURIComponent(overrideId)}`, {
    method: "DELETE",
  });
}

export async function downloadGovPolicyExport(): Promise<Blob> {
  return requestBlob(`/v1/gov/policy/export`);
}

/* ─────────── Health ─────────── */

export async function getHealth(): Promise<{ status: string }> {
  return request<{ status: string }>("/v1/health");
}
