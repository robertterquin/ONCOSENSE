import { parseDbTimestamp } from '@/lib/dates';

import { booleanOr, numberOr, optionalString, requireString, type Row } from './row';

export type Answer = {
  id: string;
  questionId: string;
  content: string;
  /** Empty on other people's anonymous answers (the database hides it). */
  userId: string;
  userName: string | null;
  isAnonymous: boolean;
  upvotes: number;
  createdAt: Date;
  updatedAt: Date;
  /** Marked as best answer by the question's author. */
  isAccepted: boolean;
  /** Set for replies to another answer. */
  parentAnswerId: string | null;
};

export function answerFromRow(row: Row): Answer {
  return {
    id: requireString(row, 'id'),
    questionId: requireString(row, 'question_id'),
    content: requireString(row, 'content'),
    userId: optionalString(row, 'user_id') ?? '',
    userName: optionalString(row, 'user_name'),
    isAnonymous: booleanOr(row, 'is_anonymous', false),
    upvotes: numberOr(row, 'upvotes', 0),
    createdAt: parseDbTimestamp(requireString(row, 'created_at')),
    updatedAt: parseDbTimestamp(requireString(row, 'updated_at')),
    isAccepted: booleanOr(row, 'is_accepted', false),
    parentAnswerId: optionalString(row, 'parent_answer_id'),
  };
}

export function answerDisplayName(answer: Answer): string {
  return answer.isAnonymous ? 'Anonymous' : (answer.userName ?? 'User');
}
