import type { ObjectValues } from '../../../../../shared/types/core';

export const BACK_BUTTON_VARIANT = {
  RED: 'red',
  NEUTRAL: 'neutral',
} as const;

export type BackButtonVariant = ObjectValues<typeof BACK_BUTTON_VARIANT>;
