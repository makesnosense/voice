import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';

import type { ContactsApi } from '../api/contacts';
import type { Contact } from '../types/contacts';

interface ContactsStore {
  contacts: Contact[];
  isLoading: boolean;
  error: string | null;
  cacheExists: boolean;

  fetchContacts: () => Promise<void>;
  addContact: (email: string) => Promise<void>;
  removeContact: (contactId: string) => Promise<void>;
  reset: () => void;
}

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export function createContactsStore(
  contactsApi: ContactsApi,
  getValidAccessToken: () => Promise<string>,
  storage?: StateStorage
) {
  return create<ContactsStore>()(
    persist(
      (set, get) => ({
        contacts: [],
        isLoading: false,
        error: null,
        cacheExists: false,

        fetchContacts: async () => {
          if (get().cacheExists || get().isLoading) return;
          set({ isLoading: true, error: null });
          try {
            const token = await getValidAccessToken();
            const contacts = await contactsApi.getContacts(token);
            set({ contacts, cacheExists: true });
          } catch (error) {
            console.error('Failed to fetch contacts:', error);
            set({ error: 'Failed to load contacts' });
          } finally {
            set({ isLoading: false });
          }
        },

        addContact: async (email: string) => {
          set({ error: null });
          try {
            const token = await getValidAccessToken();
            const contact = await contactsApi.addContact(email, token);
            set((state) => ({ contacts: [...state.contacts, contact] }));
          } catch (error) {
            console.error('Failed to add contact:', error);
            throw error;
          }
        },

        removeContact: async (contactIdToRemove: string) => {
          set({ error: null });
          try {
            const token = await getValidAccessToken();
            await contactsApi.removeContact(contactIdToRemove, token);
            set((state) => ({
              contacts: state.contacts.filter((c) => c.id !== contactIdToRemove),
            }));
          } catch (error) {
            console.error('Failed to remove contact:', error);
            throw error;
          }
        },
        reset: () => set({ contacts: [], isLoading: false, error: null, cacheExists: false }),
      }),
      {
        name: 'contacts',
        storage: createJSONStorage(() => storage ?? noopStorage),
        partialize: (state) => ({ contacts: state.contacts }),
      }
    )
  );
}
