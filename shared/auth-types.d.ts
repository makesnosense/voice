// JWT auth

export interface User {
  userId: string;
  email: string;
}

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
export interface OtpRequest {
  email: string;
}

export interface OtpVerificationRequest {
  email: string;
  code: string;
}

export interface OtpVerificationResponse {
  accessToken: string;
  refreshToken: string;
}

// export interface RenewAccessTokenRequest {
//   refreshToken: string;
// }

export interface RenewAccessTokenResponse {
  accessToken: string;
}
