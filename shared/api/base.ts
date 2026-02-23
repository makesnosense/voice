export class ApiBase {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  protected async apiFetch<T>(path: string, options: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });

    if (!response.ok) {
      type ErrorBody = { error?: string };
      const body: ErrorBody | null = await (response.json() as Promise<ErrorBody>).catch(
        () => null
      );
      throw new Error(body?.error ?? `http ${response.status}`);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : (undefined as T);
  }
}
