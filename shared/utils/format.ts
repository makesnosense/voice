import type { Message, ObjectValues, SocketId } from '../types/core';

const DAYS_IN_A_WEEK = 7;
const RECENTLY_SEEN_THRESHOLD_MINUTES = 2;
const MINUTES_IN_AN_HOUR = 60;
const HOURS_IN_A_DAY = 24;

const startOfDay = (date: Date, daysAgo = 0): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() - daysAgo);

export const formatCallTimestamp = (createdAtIso: string): string => {
  const date = new Date(createdAtIso);
  const now = new Date();

  const todayStart = startOfDay(now);
  const weekAgoStart = startOfDay(now, DAYS_IN_A_WEEK - 1);

  const isToday = date >= todayStart;
  const isWithinPastWeek = date >= weekAgoStart && date < todayStart;

  if (isToday) {
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }

  if (isWithinPastWeek) {
    return date.toLocaleDateString('en-GB', { weekday: 'short' });
  }

  const month = date.toLocaleDateString('en-GB', { month: 'short' });
  const day = date.toLocaleDateString('en-GB', { day: '2-digit' });
  return `${month} ${day}`;
};

export const LAST_SEEN_UNIT = {
  NOW: 'now',
  MINUTES: 'minutes',
  HOURS: 'hours',
  DAYS: 'days',
} as const;

export type LastSeenUnit = ObjectValues<typeof LAST_SEEN_UNIT>;

export interface LastSeen {
  unit: LastSeenUnit;
  count: number;
}

export const getLastSeen = (lastSeenIso: string): LastSeen => {
  const diffMs = Date.now() - new Date(lastSeenIso).getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < RECENTLY_SEEN_THRESHOLD_MINUTES) {
    return { unit: LAST_SEEN_UNIT.NOW, count: 0 };
  }

  if (minutes < MINUTES_IN_AN_HOUR) {
    return { unit: LAST_SEEN_UNIT.MINUTES, count: minutes };
  }

  const hours = Math.floor(minutes / MINUTES_IN_AN_HOUR);
  if (hours < HOURS_IN_A_DAY) {
    return { unit: LAST_SEEN_UNIT.HOURS, count: hours };
  }

  const days = Math.floor(hours / HOURS_IN_A_DAY);
  return { unit: LAST_SEEN_UNIT.DAYS, count: days };
};

// display name resolution — null means "nothing to show", callers translate the fallback

export const resolveDisplayName = (
  name: string | null | undefined,
  email: string | null | undefined
): string | null => name ?? email?.split('@')[0] ?? null;

export const isFromLocalUser = (
  message: Message,
  localSocketId: SocketId | null,
  authenticatedEmail: string | null
): boolean => {
  const isAuthenticated = authenticatedEmail !== null;

  return isAuthenticated
    ? message.email === authenticatedEmail
    : message.socketId === localSocketId;
};

export const MESSAGE_SENDER = {
  YOU: 'you',
  OTHER: 'other',
  NAMED: 'named',
} as const;

export type MessageSender =
  | { kind: typeof MESSAGE_SENDER.YOU }
  | { kind: typeof MESSAGE_SENDER.OTHER }
  | { kind: typeof MESSAGE_SENDER.NAMED; name: string };

export const resolveMessageSender = (
  message: Message,
  localSocketId: SocketId | null,
  authenticatedEmail: string | null
): MessageSender => {
  const isAnonymous = message.name === null && message.email === null;

  if (isAnonymous) {
    const isMine = isFromLocalUser(message, localSocketId, authenticatedEmail);
    return { kind: isMine ? MESSAGE_SENDER.YOU : MESSAGE_SENDER.OTHER };
  }

  const displayName = resolveDisplayName(message.name, message.email);
  return displayName
    ? { kind: MESSAGE_SENDER.NAMED, name: displayName }
    : { kind: MESSAGE_SENDER.OTHER };
};

export const formatDeployedAt = (isoString: string): string =>
  new Date(isoString).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
