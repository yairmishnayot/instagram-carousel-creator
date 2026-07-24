import type { StyledRange, TextSpanStyle } from './types';

/** Which (0-based) occurrence of `text` within `body` the character at `start` begins. */
export function occurrenceIndexAt(body: string, start: number, text: string): number {
  let from = 0;
  let count = 0;
  while (true) {
    const idx = body.indexOf(text, from);
    if (idx === -1 || idx === start) return count;
    count++;
    from = idx + 1;
  }
}

/** Start index of the Nth (0-based) occurrence of `text` within `body`, or -1 if not found. */
export function findOccurrenceStart(body: string, text: string, occurrence: number): number {
  let from = 0;
  for (let count = 0; ; count++) {
    const idx = body.indexOf(text, from);
    if (idx === -1) return -1;
    if (count === occurrence) return idx;
    from = idx + 1;
  }
}

interface Match {
  start: number;
  end: number;
  style: TextSpanStyle;
}

function findMatches(body: string, ranges: StyledRange[]): Match[] {
  const matches: Match[] = [];
  for (const r of ranges) {
    if (!r.text) continue;
    let idx = -1;
    let count = -1;
    let from = 0;
    while (true) {
      idx = body.indexOf(r.text, from);
      if (idx === -1) break;
      count++;
      if (count === r.occurrence) {
        matches.push({ start: idx, end: idx + r.text.length, style: r.style });
        break;
      }
      from = idx + 1;
    }
  }
  matches.sort((a, b) => a.start - b.start);
  // Drop later matches that overlap an earlier one (ranges aren't meant to nest/overlap).
  const result: Match[] = [];
  let lastEnd = -1;
  for (const m of matches) {
    if (m.start >= lastEnd) {
      result.push(m);
      lastEnd = m.end;
    }
  }
  return result;
}

export interface TextSegment {
  text: string;
  style?: TextSpanStyle;
}

/** Splits `body` into plain/styled segments, in order, for rendering. */
export function segmentText(body: string, ranges: StyledRange[] | undefined): TextSegment[] {
  if (!ranges || ranges.length === 0) return [{ text: body }];
  const matches = findMatches(body, ranges);
  if (matches.length === 0) return [{ text: body }];
  const segments: TextSegment[] = [];
  let pos = 0;
  for (const m of matches) {
    if (m.start > pos) segments.push({ text: body.slice(pos, m.start) });
    segments.push({ text: body.slice(m.start, m.end), style: m.style });
    pos = m.end;
  }
  if (pos < body.length) segments.push({ text: body.slice(pos) });
  return segments;
}
