export class ApiBase {
  constructor(private baseUrl: string) {}

  protected async apiFetch<T>(path: string, options: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error ?? `http ${response.status}`);
    }

    return response.json();
  }
}
