// Small text helpers for the Today tab (redesign Phase 3).

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
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

/** "Saturday, October 24" */
export function formatTodayDate(now: Date): string {
  return `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}`;
}

/** "Good morning, Ana" (before noon), afternoon (before 6 PM), evening; "Hello" for guests. */
export function greeting(now: Date, firstName: string | null): string {
  if (!firstName) return 'Hello';
  const hour = now.getHours();
  const part = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
  return `Good ${part}, ${firstName}`;
}

/** First word of a display name ("Ana Reyes" → "Ana"). */
export function firstName(displayName: string): string {
  return displayName.trim().split(/\s+/)[0] ?? displayName;
}
