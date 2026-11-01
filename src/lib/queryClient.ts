import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Content changes rarely; avoid refetching on every screen focus.
      staleTime: 60_000,
      retry: 1,
    },
  },
});
