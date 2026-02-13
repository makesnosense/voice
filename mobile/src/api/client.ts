export const API_BASE_URL = __DEV__
  ? 'https://localhost:3003/api'
  : 'https://voice.k.vu/api';

export async function apiFetch<T>(
  path: string,
  options: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `http ${response.status}`);
  }

  return response.json();
}
