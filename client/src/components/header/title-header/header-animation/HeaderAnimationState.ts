import type { ObjectValues } from '../../../../../../shared/types/core';

export const HEADER_ANIMATION_STATE = {
  ACTIVE: 'active',
  SILENT: 'silent',
  MUTED: 'muted',
} as const;

export type HeaderAnimationState = ObjectValues<typeof HEADER_ANIMATION_STATE>;
