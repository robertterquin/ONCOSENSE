import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { persistStorage } from '@/lib/storage';

// Community preferences (redesign Phase 5). Posting anonymously is the default, so
// people share without worrying; Settings gets the switch in Phase 6.

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
