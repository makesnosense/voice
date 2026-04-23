import { ApiBase } from './base';
import type { RenewAccessTokenResponse } from '../types/auth';

export class UsersApi extends ApiBase {
  getUserByEmail(email: string, accessToken: string): Promise<{ id: string }> {
    const params = new URLSearchParams({ email });
    return this.apiFetch<{ id: string }>(`/users?${params}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }

  updateName(name: string | null, accessToken: string): Promise<RenewAccessTokenResponse> {
    return this.apiFetch<RenewAccessTokenResponse>('/users/me', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ name }),
    });
  }

  deleteAccount(refreshToken: string): Promise<void> {
    return this.apiFetch('/users/me', {
      method: 'DELETE',
      body: JSON.stringify({ refreshToken }),
    });
  }
}
