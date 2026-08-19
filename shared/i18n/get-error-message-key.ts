import { ApiError, NetworkError } from '../errors';
import type { ErrorCode } from '../constants/errors';

export type ErrorMessageKey = 'networkError' | 'unknownError' | `errors.${ErrorCode}`;

export function getErrorMessageKey(error: unknown): ErrorMessageKey {
  if (error instanceof NetworkError) return 'networkError';

  if (error instanceof ApiError && error.errorCode !== null) {
    return `errors.${error.errorCode}`;
  }

  return 'unknownError';
}
