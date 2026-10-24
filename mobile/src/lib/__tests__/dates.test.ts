import {
  differenceInWholeDays,
  formatRelativeTime,
  formatShortDate,
  parseDbTimestamp,
  toDbTimestamp,
} from '@/lib/dates';

describe('parseDbTimestamp', () => {
  it('reads the stored digits as local time and ignores the offset', () => {
    // Flutter wrote 20:15 local; Postgres returns it as 20:15 UTC.
    const date = parseDbTimestamp('2026-10-22T20:15:30.123+00:00');
    expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([2026, 9, 22]);
    expect([date.getHours(), date.getMinutes(), date.getSeconds()]).toEqual([20, 15, 30]);
    expect(date.getMilliseconds()).toBe(123);
  });

  it('handles Dart microseconds, space separators and date-only values', () => {
    expect(parseDbTimestamp('2026-10-22T08:00:00.123456').getMilliseconds()).toBe(123);
    expect(parseDbTimestamp('2026-10-22 08:30:00+00').getMinutes()).toBe(30);
    expect(parseDbTimestamp('2026-10-22').getHours()).toBe(0);
  });

  it('rejects text that is not a timestamp', () => {
    expect(() => parseDbTimestamp('yesterday')).toThrow('Invalid timestamp');
  });
});

describe('toDbTimestamp', () => {
  it('writes local wall-clock time without an offset and round-trips', () => {
    const date = new Date(2026, 0, 5, 7, 4, 3, 9);
    expect(toDbTimestamp(date)).toBe('2026-01-05T07:04:03.009');
    expect(parseDbTimestamp(toDbTimestamp(date)).getTime()).toBe(date.getTime());
  });
});

describe('formatting', () => {
  const now = new Date(2026, 9, 22, 12, 0, 0);
  const ago = (ms: number) => new Date(now.getTime() - ms);
  const MINUTE = 60_000;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;

  it('formats relative times like the Flutter forum', () => {
    expect(formatRelativeTime(ago(30_000), now)).toBe('Just now');
    expect(formatRelativeTime(ago(MINUTE), now)).toBe('1 minute ago');
    expect(formatRelativeTime(ago(5 * HOUR), now)).toBe('5 hours ago');
    expect(formatRelativeTime(ago(DAY), now)).toBe('1 day ago');
    expect(formatRelativeTime(ago(30 * DAY), now)).toBe('30 days ago');
    expect(formatRelativeTime(ago(62 * DAY), now)).toBe('2 months ago');
    expect(formatRelativeTime(ago(400 * DAY), now)).toBe('1 year ago');
  });

  it('formats short dates and whole-day differences', () => {
    expect(formatShortDate(new Date(2026, 9, 22))).toBe('Oct 22, 2026');
    expect(differenceInWholeDays(now, ago(DAY + HOUR))).toBe(1);
    expect(differenceInWholeDays(now, ago(DAY - HOUR))).toBe(0);
  });
});
