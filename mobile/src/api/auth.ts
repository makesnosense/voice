import { apiFetch } from './client';
import type {
  OtpVerificationResponse,
  RenewAccessTokenResponse,
} from '../../../shared/auth-types';

export async function requestOtp(email: string): Promise<void> {
  await apiFetch('/auth/request-otp', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function verifyOtp(
  email: string,
  code: string,
): Promise<OtpVerificationResponse> {
  return apiFetch<OtpVerificationResponse>('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  });
}

export async function renewAccessToken(
  refreshToken: string,
): Promise<RenewAccessTokenResponse> {
  return apiFetch<RenewAccessTokenResponse>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}

export async function deleteSession(refreshToken: string): Promise<void> {
  await apiFetch('/auth/sessions/current', {
    method: 'DELETE',
    body: JSON.stringify({ refreshToken }),
  });
}
