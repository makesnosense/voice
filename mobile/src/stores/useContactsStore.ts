import { createContactsStore } from '../../../shared/stores/createContactsStore';
import { api } from '../api';
import { useAuthStore } from './useAuthStore';
import { mmkvStorage } from '../utils/mmkv';

export const useContactsStore = createContactsStore(
  api.contacts,
  () => useAuthStore.getState().getValidAccessToken(),
  mmkvStorage,
);

useAuthStore.subscribe((state, prevState) => {
  if (prevState.isAuthenticated && !state.isAuthenticated) {
    useContactsStore.getState().reset();
  }
});
