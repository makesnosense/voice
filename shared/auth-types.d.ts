// JWT auth

export interface AccessTokenPayload {
  userId: string;
  email: string;
  exp: number;
  iat: number;
}

export interface RefreshTokenPayload {
  userId: string;
  jti: string;
  iat: number;
}

// auth DTOs
export interface RequestOtpRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  code: string;
}

export interface VerifyOtpResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshAccessTokenRequest {
  refreshToken: string;
}

export interface RefreshAccessTokenResponse {
  accessToken: string;
}
