import {
  getLastSeen,
  LAST_SEEN_UNIT,
  resolveDisplayName,
  resolveMessageSender,
  MESSAGE_SENDER,
} from '../../../shared/utils/format';
import type { Message, SocketId } from '../../../shared/types/core';

// wrappers around shared getLastSeen, resolveDisplayName, resolveMessageSender
// with no TFunction for now

export const formatLastSeen = (lastSeenIso: string): string => {
  const { unit, count } = getLastSeen(lastSeenIso);

  if (unit === LAST_SEEN_UNIT.NOW) return 'active now';
  if (unit === LAST_SEEN_UNIT.MINUTES) return `${count}m ago`;
  if (unit === LAST_SEEN_UNIT.HOURS) return `${count}h ago`;
  return `${count}d ago`;
};

export const formatDisplayName = (
  name: string | null | undefined,
  email: string | null | undefined
): string => resolveDisplayName(name, email) ?? 'Other';

export const getMessageSenderName = (
  message: Message,
  localSocketId: SocketId | null,
  authenticatedEmail: string | null
): string => {
  const sender = resolveMessageSender(message, localSocketId, authenticatedEmail);

  switch (sender.kind) {
    case MESSAGE_SENDER.YOU:
      return 'You';
    case MESSAGE_SENDER.OTHER:
      return 'Other';
    case MESSAGE_SENDER.NAMED:
      return sender.name;
  }
};
