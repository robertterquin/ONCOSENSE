import { formatRelativeTime } from './dates';

// Community text helpers (redesign Phase 5).

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

/** "3 answers · 5 found this helpful · 2 hours ago" under a question's title. */
export function questionMeta(
  question: { answerCount: number; upvotes: number; createdAt: Date },
  now: Date = new Date(),
): string {
  const parts = [
    question.answerCount === 0
      ? 'No answers yet'
      : plural(question.answerCount, 'answer', 'answers'),
  ];
  if (question.upvotes > 0) parts.push(`${question.upvotes} found this helpful`);
  parts.push(formatRelativeTime(question.createdAt, now));
  return parts.join(' · ');
}

/** "AR" for "Ana Reyes"; "?" when there is no name. */
export function initials(name: string | null): string {
  const letters = (name ?? '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
  return letters || '?';
}
