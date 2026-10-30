import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { persistStorage } from '@/lib/storage';

// Community preferences (redesign Phase 5). Posting anonymously starts on, so people
// share without worrying; after that the post forms remember the last choice.

type CommunityStore = {
  anonymousByDefault: boolean;
  setAnonymousByDefault: (value: boolean) => void;
};

export const useCommunityStore = create<CommunityStore>()(
  persist(
    (set) => ({
      anonymousByDefault: true,
      setAnonymousByDefault: (anonymousByDefault) => set({ anonymousByDefault }),
    }),
    { name: 'community', storage: persistStorage, version: 1 },
  ),
);
