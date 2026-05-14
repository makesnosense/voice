import { ApiBase } from './base';
import type { RenewAccessTokenResponse } from '../types/auth';
import type { DataExport } from '../types/core';
import type { PublicUser } from '../types/users';

export class UsersApi extends ApiBase {
  getUserByEmail(email: string, accessToken: string): Promise<PublicUser> {
    const params = new URLSearchParams({ email });
    return this.apiFetch<PublicUser>(`/users?${params}`, {
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

  exportData(accessToken: string): Promise<DataExport> {
    return this.apiFetch('/users/me/export', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }
}
