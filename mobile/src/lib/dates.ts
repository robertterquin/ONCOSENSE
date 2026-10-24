/**
 * Date helpers that match how the Flutter app reads and writes dates.
 *
 * The Flutter app writes timestamps with Dart's `DateTime.now().toIso8601String()`,
 * which is the device's local wall-clock time with no time-zone offset. Postgres
 * stores that in `timestamptz` columns as if it were UTC, and Flutter reads the
 * UTC wall-clock back and treats it as local. So a "floating" wall-clock time
 * round-trips between devices, ignoring the offset.
 *
 * To read and write the same rows without shifting days, this app does the same:
 * `toDbTimestamp` writes local wall-clock time without an offset, and
 * `parseDbTimestamp` reads the stored digits as local time and ignores any offset.
 */

const TIMESTAMP_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?)?/;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const MS_PER_MINUTE = 60_000;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

/** Parses a database timestamp as local wall-clock time, ignoring any offset. */
export function parseDbTimestamp(value: string): Date {
  const match = TIMESTAMP_PATTERN.exec(value);
  if (!match) {
    throw new Error(`Invalid timestamp: ${value}`);
  }
  const [, year, month, day, hour = '0', minute = '0', second = '0', fraction = '0'] = match;
  const ms = Number(fraction.padEnd(3, '0').slice(0, 3));
  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
    ms,
  );
}

/** Like `parseDbTimestamp`, but returns `null` for missing values. */
export function parseOptionalDbTimestamp(value: unknown): Date | null {
  return typeof value === 'string' && value ? parseDbTimestamp(value) : null;
}

const pad = (value: number, length = 2) => String(value).padStart(length, '0');

/** Formats a date as local wall-clock time without an offset (Dart's `toIso8601String`). */
export function toDbTimestamp(date: Date): string {
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}` +
    `.${pad(date.getMilliseconds(), 3)}`
  );
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Returns a copy of `date` moved by `days` calendar days. */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** Whole days between two instants, truncated toward zero (Dart's `difference().inDays`). */
export function differenceInWholeDays(later: Date, earlier: Date): number {
  return Math.trunc((later.getTime() - earlier.getTime()) / MS_PER_DAY);
}

/** "Oct 22, 2026" */
export function formatShortDate(date: Date): string {
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

const plural = (count: number, unit: string) => `${count} ${count === 1 ? unit : `${unit}s`} ago`;

/** "2 hours ago", "3 days ago", "Just now" — used by forum questions and answers. */
export function formatRelativeTime(date: Date, now: Date = new Date()): string {
  const elapsed = now.getTime() - date.getTime();
  const days = Math.trunc(elapsed / MS_PER_DAY);
  const hours = Math.trunc(elapsed / MS_PER_HOUR);
  const minutes = Math.trunc(elapsed / MS_PER_MINUTE);

  if (days > 365) return plural(Math.floor(days / 365), 'year');
  if (days > 30) return plural(Math.floor(days / 30), 'month');
  if (days > 0) return plural(days, 'day');
  if (hours > 0) return plural(hours, 'hour');
  if (minutes > 0) return plural(minutes, 'minute');
  return 'Just now';
}

const LONG_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/** "October 22, 2026" */
export function formatLongDate(date: Date): string {
  return `${LONG_MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}
