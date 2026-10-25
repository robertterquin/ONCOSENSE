import { parseDbTimestamp } from '@/lib/dates';

import { booleanOr, numberOr, optionalString, requireString, stringArray, type Row } from './row';

export type Question = {
  id: string;
  title: string;
  content: string;
  category: string;
  /** Empty on other people's anonymous questions (the database hides it). */
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
    userId: optionalString(row, 'user_id') ?? '',
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

export function questionDisplayName(question: Question): string {
  if (question.isAnonymous) return 'Anonymous';
  if (!question.userName) return `User ${question.userId.slice(0, 8)}`;
  return question.userName;
}

export const FORUM_CATEGORIES = [
  'Symptoms',
  'Diagnosis',
  'Treatment',
  'Mental Health',
  'Lifestyle',
  'Family Support',
] as const;
