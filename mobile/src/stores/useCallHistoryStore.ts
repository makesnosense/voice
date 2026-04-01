import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import uuid from 'react-native-uuid';
import { mmkvStorage } from '../utils/mmkv';
import { useAuthStore } from './useAuthStore';
import { api } from '../api';

import type { CallHistoryEntry } from '../../../shared/types/calls';

const HISTORY_CAP = 20;

interface CallHistoryStore {
  history: CallHistoryEntry[];
  isLoading: boolean;
  cacheExists: boolean;

  fetchHistory: () => Promise<void>;
  prependEntry: (entry: Omit<CallHistoryEntry, 'id' | 'createdAt'>) => void;
  reset: () => void;
}

function createCallHistoryStore(getValidAccessToken: () => Promise<string>) {
  return create<CallHistoryStore>()(
    persist(
      (set, get) => ({
        history: [],
        isLoading: false,
        cacheExists: false,

        fetchHistory: async () => {
          if (get().cacheExists || get().isLoading) return;
          set({ isLoading: true });
          try {
            const token = await getValidAccessToken();
            const history = await api.calls.getHistory(token);
            set({ history, cacheExists: true, isLoading: false });
          } catch (error) {
            console.error('❌ Failed to fetch call history:', error);
            set({ isLoading: false });
          }
        },

        prependEntry: entry => {
          const newEntry: CallHistoryEntry = {
            ...entry,
            id: uuid.v4() as string,
            createdAt: new Date().toISOString(),
          };
          set(state => ({
            history: [newEntry, ...state.history].slice(0, HISTORY_CAP),
          }));
        },

        reset: () => set({ history: [], isLoading: false, cacheExists: false }),
      }),
      {
        name: 'call_history',
        storage: createJSONStorage(() => mmkvStorage),
        partialize: state => ({ history: state.history }),
      },
    ),
  );
}

export const useCallHistoryStore = createCallHistoryStore(() =>
  useAuthStore.getState().getValidAccessToken(),
);

useAuthStore.subscribe((state, prevState) => {
  if (prevState.isAuthenticated && !state.isAuthenticated) {
    useCallHistoryStore.getState().reset();
  }
});
