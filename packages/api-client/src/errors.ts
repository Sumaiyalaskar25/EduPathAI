export class ApiError extends Error {
  readonly status?: number;
  readonly body?: unknown;

  constructor(message: string, status?: number, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export async function toApiError(response: Response): Promise<ApiError> {
  let body: unknown = undefined;
  try {
    body = await response.json();
  } catch {
    body = undefined;
  }
  return new ApiError(
    `EduPathAI API responded with HTTP ${response.status}`,
    response.status,
    body,
  );
}