import type { ErrorCode } from './constants/errors';

export interface ApiErrorResponse {
  errorMessage: string;
  errorCode: ErrorCode;
  details?: unknown;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly errorCode: ErrorCode | null;

  constructor(status: number, message: string, errorCode: ErrorCode | null = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errorCode = errorCode;
  }
}

export class NetworkError extends Error {
  constructor() {
    super('Network request failed');
    this.name = 'NetworkError';
  }
}
