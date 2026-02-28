export class ApiBase {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  protected async apiFetch<T>(path: string, options: RequestInit): Promise<T> {
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
      });
    } catch {
      throw new NetworkError();
    }

    if (!response.ok) {
      type ErrorBody = { error?: string };
      const body: ErrorBody | null = await (response.json() as Promise<ErrorBody>).catch(
        () => null
      );
      throw new ApiError(response.status, body?.error ?? `http ${response.status}`);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : (undefined as T);
  }
}

export class ApiError extends Error {
  public readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export class NetworkError extends Error {
  constructor() {
    super('Network request failed');
    this.name = 'NetworkError';
  }
}
