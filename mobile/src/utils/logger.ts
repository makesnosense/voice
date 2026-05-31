import { createMMKV } from 'react-native-mmkv';
import type { ObjectValues } from '../../../shared/types/core';

const LOG_LEVEL = {
  LOG: 'log',
  WARN: 'warn',
  ERROR: 'error',
} as const;

type LogLevel = ObjectValues<typeof LOG_LEVEL>;

interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
}

const BUFFER_KEY = 'log_buffer';
const BUFFER_CAP = 1000;

const logMMKVStorage = createMMKV({ id: 'voice-log' });

// capture before installLogger patches them
const originalLog = console.log.bind(console);
const originalWarn = console.warn.bind(console);
const originalError = console.error.bind(console);

function loadBuffer(): LogEntry[] {
  try {
    const stored = logMMKVStorage.getString(BUFFER_KEY);
    return stored ? (JSON.parse(stored) as LogEntry[]) : [];
  } catch {
    return [];
  }
}

const buffer: LogEntry[] = loadBuffer();
let saveTimer: ReturnType<typeof setTimeout> | null = null;

function formatArgs(args: unknown[]): string {
  return args
    .map(arg => {
      if (arg instanceof Error) return `${arg.message}\n${arg.stack ?? ''}`;
      if (typeof arg === 'object' && arg !== null) {
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    })
    .join(' ');
}

function scheduleSaveToMMKV(): void {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    logMMKVStorage.set(BUFFER_KEY, JSON.stringify(buffer));
    saveTimer = null;
  }, 1000);
}

function appendEntry(level: LogLevel, args: unknown[]): void {
  if (buffer.length >= BUFFER_CAP) {
    buffer.shift();
  }
  buffer.push({ timestamp: Date.now(), level, message: formatArgs(args) });
  scheduleSaveToMMKV();
}

export function installLogger(): void {
  console.log = (...args: unknown[]) => {
    originalLog(...args);
    appendEntry(LOG_LEVEL.LOG, args);
  };
  console.warn = (...args: unknown[]) => {
    originalWarn(...args);
    appendEntry(LOG_LEVEL.WARN, args);
  };
  console.error = (...args: unknown[]) => {
    originalError(...args);
    appendEntry(LOG_LEVEL.ERROR, args);
  };
}

function formatTimestamp(entryTimestamp: number): string {
  const entryDT = new Date(entryTimestamp);
  const toTwoDigits = (value: number) => String(value).padStart(2, '0');
  return (
    `${entryDT.getFullYear()}-${toTwoDigits(
      entryDT.getMonth() + 1,
    )}-${toTwoDigits(entryDT.getDate())} ` +
    `${toTwoDigits(entryDT.getHours())}:${toTwoDigits(
      entryDT.getMinutes(),
    )}:${toTwoDigits(entryDT.getSeconds())}`
  );
}

export function formatLogsForSharing(): string {
  const header = `Voice log — ${new Date().toISOString().slice(0, 10)}\n---\n`;
  const lines = buffer.map(
    ({ timestamp, level, message }) =>
      `${formatTimestamp(timestamp)} [${level.toUpperCase()}] ${message}`,
  );
  return header + lines.join('\n');
}
