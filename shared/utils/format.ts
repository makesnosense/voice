import type { Message, SocketId } from '../types/core';

const DAYS_IN_A_WEEK = 7;

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

export const formatLastSeen = (lastSeen: string): string => {
  const diffMs = Date.now() - new Date(lastSeen).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 2) return 'active now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export const formatDisplayName = (
  name: string | null | undefined,
  email: string | null | undefined
): string => {
  return name ?? email?.split('@')[0] ?? 'Other';
};

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

export const getMessageSenderName = (
  message: Message,
  localSocketId: SocketId | null,
  authenticatedEmail: string | null
): string => {
  const isAnonymous = message.name === null && message.email === null;

  if (isAnonymous) {
    return isFromLocalUser(message, localSocketId, authenticatedEmail) ? 'You' : 'Other';
  }

  return formatDisplayName(message.name, message.email);
};

export const formatDeployedAt = (isoString: string): string =>
  new Date(isoString).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
