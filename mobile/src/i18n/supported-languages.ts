import type { ObjectValues } from '../../../shared/types/core';

const SUPPORTED_LANGUAGES = {
  EN: 'en',
  RU: 'ru',
} as const;

export type SupportedLanguage = ObjectValues<typeof SUPPORTED_LANGUAGES>;

export function isSupportedLanguage(code: string): code is SupportedLanguage {
  return (Object.values(SUPPORTED_LANGUAGES) as string[]).includes(code);
}
