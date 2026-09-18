import { toApiError } from "./errors";

export interface ApiClientOptions {
  baseUrl?: string;
  headers?: Record<string, string>;
  fetchImpl?: typeof fetch;
}

export interface RequestOptions {
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

export function resolveBaseUrl(baseUrl?: string): string {
  if (baseUrl && baseUrl.trim().length > 0) {
    return baseUrl.replace(/\/+$/, "");
  }
  const envBase =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.API_BASE_URL
      : undefined;
  return (envBase?.trim() ?? "http://127.0.0.1:8000").replace(/\/+$/, "");
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly defaultHeaders: Record<string, string>;
  private readonly fetchImpl: typeof fetch;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = resolveBaseUrl(options.baseUrl);
    this.defaultHeaders = options.headers ?? {};
    this.fetchImpl = options.fetchImpl ?? fetch.bind(globalThis);
  }

  get base(): string {
    return this.baseUrl;
  }

  private async request<T>(
    path: string,
    init: RequestInit,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const response = await this.fetchImpl(url, {
      ...init,
      headers: {
        ...this.defaultHeaders,
        ...init.headers,
      },
    });

    if (!response.ok) {
      throw await toApiError(response);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  async get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      method: "GET",
      signal: options?.signal,
      headers: options?.headers,
    });
  }

  async post<T>(
    path: string,
    body: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      body: JSON.stringify(body),
      signal: options?.signal,
    });
  }
}

export function createApiClient(options?: ApiClientOptions): ApiClient {
  return new ApiClient(options);
}