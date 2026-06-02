import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { createMMKV } from 'react-native-mmkv';
import { useAuthStore } from './stores/useAuthStore';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});

const mmkv = createMMKV({ id: 'query-cache' });

export const queryPersister = createAsyncStoragePersister({
  storage: {
    getItem: (key: string) => Promise.resolve(mmkv.getString(key) ?? null),
    setItem: (key: string, value: string) =>
      Promise.resolve(mmkv.set(key, value)),
    removeItem: (key: string) => {
      mmkv.remove(key);
      return Promise.resolve();
    },
  },
});

useAuthStore.subscribe((state, prevState) => {
  const didLogOut = prevState.isAuthenticated && !state.isAuthenticated;
  if (didLogOut) {
    queryClient.clear();
    mmkv.clearAll();
  }
});
