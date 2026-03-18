import { createContactsStore } from '../../../shared/stores/createContactsStore';
import { api } from '../api';
import { useAuthStore } from './useAuthStore';

export const useContactsStore = createContactsStore(api.contacts, () =>
  useAuthStore.getState().getValidAccessToken(),
);
