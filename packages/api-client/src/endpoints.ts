import type {
  AuditRecord,
  HealthStatus,
  PathwayRequest,
  PathwayResponse,
  UUID,
} from "@edupathai/api-types";
import type { ApiClient } from "./client";
import type { RequestOptions } from "./client";

export interface BackendApi {
  requestPathway(body: PathwayRequest, options?: RequestOptions): Promise<PathwayResponse>;
  getAuditRecord(decisionId: UUID, options?: RequestOptions): Promise<AuditRecord>;
  health(options?: RequestOptions): Promise<HealthStatus>;
}

export function createBackendApi(client: ApiClient): BackendApi {
  return {
    requestPathway: (body, options) =>
      client.post<PathwayResponse>("/v1/pathway/request", body, options),
    getAuditRecord: (decisionId, options) =>
      client.get<AuditRecord>(`/v1/audit/${decisionId}`, options),
    health: (options) => client.get<HealthStatus>("/health", options),
  };
}