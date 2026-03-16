import type { ObjectValues } from '../types/core';

export const PLATFORM = {
  WEB: 'web',
  IOS: 'ios',
  ANDROID: 'android',
} as const;

export type Platform = ObjectValues<typeof PLATFORM>;
