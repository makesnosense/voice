import type { ObjectValues } from './types';

export const PLATFORM = {
  WEB: 'web',
  IOS: 'ios',
  ANDROID: 'android',
} as const;

export type Platform = ObjectValues<typeof PLATFORM>;
