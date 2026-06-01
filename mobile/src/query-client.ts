import { QueryClient } from '@tanstack/react-query';
import { useAuthStore } from './stores/useAuthStore';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      // staleTime: Infinity on queries makes this a no-op anyway,
      // but false is the right default for manually-refreshed server state
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});

useAuthStore.subscribe((state, prevState) => {
  const didLogOut = prevState.isAuthenticated && !state.isAuthenticated;
  if (didLogOut) queryClient.clear();
});
