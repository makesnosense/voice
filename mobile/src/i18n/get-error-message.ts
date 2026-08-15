import type { TFunction } from 'i18next';
import { ApiError, NetworkError } from '../../../shared/errors';

export function getErrorMessage(error: unknown, t: TFunction): string {
  if (error instanceof NetworkError) return t('networkError');

  if (error instanceof ApiError && error.errorCode !== null) {
    return t(`errors.${error.errorCode}`);
  }

  return t('unknownError');
}
