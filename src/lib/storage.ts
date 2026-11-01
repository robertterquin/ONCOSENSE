// Provides a persistent `localStorage` on iOS and Android (backed by SQLite).
// Import storage through this module so the polyfill is always installed first.
import 'expo-sqlite/localStorage/install';

import { createJSONStorage } from 'zustand/middleware';

/** Storage for persisted Zustand stores. */
export const persistStorage = createJSONStorage(() => localStorage);
