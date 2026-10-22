import { create } from 'zustand';

// Short messages at the bottom of the screen (the Flutter app's SnackBars).

export type ToastType = 'success' | 'error' | 'info';

type Toast = { id: number; message: string; type: ToastType };

type ToastState = {
  toast: Toast | null;
  show: (message: string, type?: ToastType) => void;
  hide: () => void;
};

let nextId = 1;

export const useToastStore = create<ToastState>()((set) => ({
  toast: null,
  show: (message, type = 'info') => set({ toast: { id: nextId++, message, type } }),
  hide: () => set({ toast: null }),
}));

/** Shows a toast from anywhere (screens, hooks, callbacks). */
export function showToast(message: string, type: ToastType = 'info') {
  useToastStore.getState().show(message, type);
}
