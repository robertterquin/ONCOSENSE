import { formatRelativeTime, parseDbTimestamp } from '@/lib/dates';

import { booleanOr, numberOr, optionalString, requireString, stringArray, type Row } from './row';

export type Question = {
  id: string;
  title: string;
  content: string;
  category: string;
  userId: string;
  /** `null` when anonymous. */
  userName: string | null;
  /** `null` when anonymous or the user has no photo. */
  profilePictureUrl: string | null;
  isAnonymous: boolean;
  upvotes: number;
  answerCount: number;
  createdAt: Date;
  updatedAt: Date;
  isResolved: boolean;
  tags: string[];
};

export function questionFromRow(row: Row): Question {
  return {
    id: requireString(row, 'id'),
    title: requireString(row, 'title'),
    content: requireString(row, 'content'),
    category: requireString(row, 'category'),
    userId: requireString(row, 'user_id'),
    userName: optionalString(row, 'user_name'),
    profilePictureUrl: optionalString(row, 'profile_picture_url'),
    isAnonymous: booleanOr(row, 'is_anonymous', false),
    upvotes: numberOr(row, 'upvotes', 0),
    answerCount: numberOr(row, 'answer_count', 0),
    createdAt: parseDbTimestamp(requireString(row, 'created_at')),
    updatedAt: parseDbTimestamp(requireString(row, 'updated_at')),
    isResolved: booleanOr(row, 'is_resolved', false),
    tags: stringArray(row, 'tags'),
  };
}

const ANONYMOUS_NAMES = [
  'Anonymous User',
  'Anonymous Helper',
  'Anonymous Friend',
  'Anonymous Supporter',
  'Anonymous Warrior',
  'Anonymous Hope',
  'Anonymous Light',
  'Anonymous Care',
  'Anonymous Heart',
  'Anonymous Soul',
];

/**
 * Same anonymous name for the same user every time. Dart's `String.hashCode` isn't
 * reproducible in JavaScript, so the name may differ from the one Flutter shows.
 */
function anonymousName(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) | 0;
  }
  return ANONYMOUS_NAMES[Math.abs(hash) % ANONYMOUS_NAMES.length];
}

export function questionDisplayName(question: Question): string {
  if (question.isAnonymous) return anonymousName(question.userId);
  if (!question.userName) return `User ${question.userId.slice(0, 8)}`;
  return question.userName;
}

export function questionRelativeTime(question: Question, now?: Date): string {
  return formatRelativeTime(question.createdAt, now);
}

export const FORUM_CATEGORIES = [
  'Symptoms',
  'Diagnosis',
  'Treatment',
  'Mental Health',
  'Lifestyle',
  'Family Support',
] as const;

export type ForumCategory = (typeof FORUM_CATEGORIES)[number];

export function forumCategoryIcon(category: string): string {
  switch (category) {
    case 'Symptoms':
      return '🩺';
    case 'Diagnosis':
      return '🔬';
    case 'Treatment':
      return '💊';
    case 'Mental Health':
      return '🧠';
    case 'Lifestyle':
      return '💪';
    case 'Family Support':
      return '👨‍👩‍👧‍👦';
    default:
      return '💬';
  }
}
