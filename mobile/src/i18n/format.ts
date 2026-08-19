import type { TFunction } from 'i18next';
import {
  getLastSeen,
  LAST_SEEN_UNIT,
  resolveDisplayName,
  resolveMessageSender,
  MESSAGE_SENDER,
} from '../../../shared/utils/format';
import type { Message, SocketId } from '../../../shared/types/core';

// wrappers around shared getLastSeen, resolveDisplayName, resolveMessageSender
// with local TFunction

export const formatLastSeen = (lastSeenIso: string, t: TFunction): string => {
  const { unit, count } = getLastSeen(lastSeenIso);

  if (unit === LAST_SEEN_UNIT.NOW) return t('devices.activeNow');
  if (unit === LAST_SEEN_UNIT.MINUTES)
    return t('devices.minutesAgo', { count });
  if (unit === LAST_SEEN_UNIT.HOURS) return t('devices.hoursAgo', { count });
  return t('devices.daysAgo', { count });
};

export const formatDisplayName = (
  name: string | null | undefined,
  email: string | null | undefined,
  t: TFunction,
): string => resolveDisplayName(name, email) ?? t('common.other');

export const getMessageSenderName = (
  message: Message,
  localSocketId: SocketId | null,
  authenticatedEmail: string | null,
  t: TFunction,
): string => {
  const sender = resolveMessageSender(
    message,
    localSocketId,
    authenticatedEmail,
  );

  switch (sender.kind) {
    case MESSAGE_SENDER.YOU:
      return t('common.you');
    case MESSAGE_SENDER.OTHER:
      return t('common.other');
    case MESSAGE_SENDER.NAMED:
      return sender.name;
  }
};
