import { useIsSignedIn } from '@/stores/authStore';
import { showToast } from '@/stores/toastStore';

import {
  useBookmarkedArticles,
  useBookmarkedQuestions,
  useBookmarkedResources,
  useToggleArticleBookmark,
  useToggleQuestionBookmark,
  useToggleResourceBookmark,
} from './useBookmarks';
import type { Article } from '@/types/article';
import type { Question } from '@/types/question';
import type { Resource } from '@/types/resource';

// Screen-level bookmark helpers: "is it saved?", and a toggle that shows the same
// messages as the Flutter screens. Guests are asked to sign in instead (Flutter
// silently failed and said "removed").

function useGuard() {
  const signedIn = useIsSignedIn();
  return (action: () => void) => {
    if (!signedIn) {
      showToast('Sign in to save items to your profile', 'info');
      return;
    }
    action();
  };
}

export function useResourceBookmarks() {
  const saved = useBookmarkedResources().data ?? [];
  const { toggle } = useToggleResourceBookmark();
  const guard = useGuard();
  const isSaved = (resource: Resource) => saved.some((item) => item.id === resource.id);
  return {
    isSaved,
    toggle: (resource: Resource) =>
      guard(() => {
        showToast(
          isSaved(resource) ? 'Resource removed from saved' : '✅ Resource saved!',
          isSaved(resource) ? 'info' : 'success',
        );
        toggle(resource);
      }),
  };
}

export function useArticleBookmarks() {
  const saved = useBookmarkedArticles().data ?? [];
  const { toggle } = useToggleArticleBookmark();
  const guard = useGuard();
  const isSaved = (article: Article) => saved.some((item) => item.url === article.url);
  return {
    isSaved,
    toggle: (article: Article) =>
      guard(() => {
        showToast(
          isSaved(article) ? 'Article removed from bookmarks' : 'Article saved to bookmarks',
          isSaved(article) ? 'info' : 'success',
        );
        toggle(article);
      }),
  };
}

export function useQuestionBookmarks() {
  const saved = useBookmarkedQuestions().data ?? [];
  const { toggle } = useToggleQuestionBookmark();
  const guard = useGuard();
  const isSaved = (question: Question) => saved.some((item) => item.id === question.id);
  return {
    isSaved,
    toggle: (question: Question) =>
      guard(() => {
        showToast(
          isSaved(question) ? 'Question removed from bookmarks' : '✅ Question bookmarked!',
          isSaved(question) ? 'info' : 'success',
        );
        toggle(question);
      }),
  };
}
