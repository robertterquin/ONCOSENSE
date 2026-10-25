import type { QuestionFilters } from '@/api/community';
import type { ResourceType } from '@/types/resource';

/**
 * All TanStack Query keys in one place. Per-user data includes the user id, so
 * signing in as someone else never shows the previous user's cached data.
 */
export const queryKeys = {
  cancerTypes: ['cancerTypes'] as const,
  cancerType: (id: string) => ['cancerTypes', id] as const,

  preventionTips: ['prevention', 'tips'] as const,
  selfCheckGuides: ['prevention', 'guides'] as const,
  selfCheckGuide: (id: string) => ['prevention', 'guide', id] as const,

  resourcesByCategory: ['resources', 'byCategory'] as const,
  resourcesByType: (type: ResourceType) => ['resources', 'type', type] as const,

  questions: (filters: QuestionFilters = {}) => ['forum', 'questions', filters] as const,
  allQuestions: ['forum', 'questions'] as const,
  question: (id: string) => ['forum', 'question', id] as const,
  answers: (questionId: string) => ['forum', 'answers', questionId] as const,
  questionUpvoted: (userId: string | null, id: string) =>
    ['forum', 'upvoted', userId, 'question', id] as const,
  answerUpvoted: (userId: string | null, id: string) =>
    ['forum', 'upvoted', userId, 'answer', id] as const,

  bookmarkedQuestions: (userId: string | null) => ['bookmarks', userId, 'questions'] as const,
  bookmarkedResources: (userId: string | null) => ['bookmarks', userId, 'resources'] as const,

  journeyEntries: (userId: string | null) => ['journey', userId, 'entries'] as const,
  treatments: (userId: string | null) => ['journey', userId, 'treatments'] as const,
  milestones: (userId: string | null) => ['journey', userId, 'milestones'] as const,
  appointments: (userId: string | null) => ['journey', userId, 'appointments'] as const,
};
