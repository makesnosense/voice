import type { TFunction } from 'i18next';
import { getErrorMessageKey } from '../../../shared/i18n/get-error-message-key';

// because we need local TFunction
export function getErrorMessage(error: unknown, t: TFunction): string {
  return t(getErrorMessageKey(error));
}
