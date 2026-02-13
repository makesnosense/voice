import { ApiBase } from './base';
import type { OtpVerificationResponse, RenewAccessTokenResponse } from '../auth-types';

export class AuthApi extends ApiBase {
  requestOtp(email: string): Promise<void> {
    return this.apiFetch('/auth/request-otp', { method: 'POST', body: JSON.stringify({ email }) });
  }

  verifyOtp(email: string, code: string): Promise<OtpVerificationResponse> {
    return this.apiFetch<OtpVerificationResponse>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  }

  renewAccessToken(refreshToken: string): Promise<RenewAccessTokenResponse> {
    return this.apiFetch<RenewAccessTokenResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  deleteSession(refreshToken: string): Promise<void> {
    return this.apiFetch('/auth/sessions/current', {
      method: 'DELETE',
      body: JSON.stringify({ refreshToken }),
    });
  }
}
