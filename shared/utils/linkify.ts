import type { ObjectValues } from '../types/core';

export const TEXT_SEGMENT_TYPE = {
  TEXT: 'text',
  LINK: 'link',
} as const;

export type TextSegmentType = ObjectValues<typeof TEXT_SEGMENT_TYPE>;

// only http/https urls become links
const URL_PATTERN = /https?:\/\/[^\s<>]+/g;
const TRAILING_PUNCTUATION = /[.,!?;:)\]}'"]+$/;

export interface TextSegment {
  type: TextSegmentType;
  value: string;
}

// splits message text into plain-text and link segments.
export const splitTextWithLinks = (text: string): TextSegment[] => {
  const segments: TextSegment[] = [];
  let cursor = 0;

  const matches = Array.from(text.matchAll(URL_PATTERN));

  for (const match of matches) {
    const matchStart = match.index ?? 0;
    const trailingPunctuationMatch = match[0].match(TRAILING_PUNCTUATION);
    const trailingPunctuation = trailingPunctuationMatch?.[0] ?? '';
    const url = trailingPunctuation ? match[0].slice(0, -trailingPunctuation.length) : match[0];

    const textBeforeLink = text.slice(cursor, matchStart);
    if (textBeforeLink) segments.push({ type: TEXT_SEGMENT_TYPE.TEXT, value: textBeforeLink });
    segments.push({ type: TEXT_SEGMENT_TYPE.LINK, value: url });

    cursor = matchStart + url.length;
  }

  const remainingText = text.slice(cursor);
  if (remainingText) segments.push({ type: TEXT_SEGMENT_TYPE.TEXT, value: remainingText });

  return segments;
};
