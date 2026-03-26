import { ApiBase } from './base';

export class UsersApi extends ApiBase {
  getUserByEmail(email: string, accessToken: string): Promise<{ id: string }> {
    const params = new URLSearchParams({ email });
    return this.apiFetch<{ id: string }>(`/users?${params}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }
}
