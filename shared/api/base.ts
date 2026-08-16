import { NetworkError, ApiError, type ApiErrorResponse } from '../errors';

export class ApiBase {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  protected async apiFetch<T>(path: string, options: RequestInit): Promise<T> {
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
    } catch (error) {
      throw new NetworkError(error);
    }

    if (!response.ok) {
      const body: Partial<ApiErrorResponse> | null = await (
        response.json() as Promise<Partial<ApiErrorResponse>>
      ).catch(() => null);
      throw new ApiError(
        response.status,
        body?.errorMessage ?? `http ${response.status}`,
        body?.errorCode ?? null
      );
    }

    const text = await response.text();
    return text ? JSON.parse(text) : (undefined as T);
  }
}
