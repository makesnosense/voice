import { create } from 'zustand';
import { api } from '../api';
import { useAuthStore } from './useAuthStore';
import type { Contact } from '../../../shared/contacts-types';

interface ContactsStore {
  contacts: Contact[];
  isLoading: boolean;
  error: string | null;
  cacheExists: boolean;

  fetchContacts: () => Promise<void>;
  addContact: (email: string) => Promise<void>;
  removeContact: (contactId: string) => Promise<void>;
}

export const useContactsStore = create<ContactsStore>((set, get) => ({
  contacts: [],
  isLoading: false,
  error: null,
  cacheExists: false,

  fetchContacts: async () => {
    if (get().cacheExists || get().isLoading) return;

    set({ isLoading: true, error: null });
    try {
      const token = await useAuthStore.getState().getValidAccessToken();
      const contacts = await api.contacts.getContacts(token);
      set({ contacts, cacheExists: true });
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
      set({ error: 'failed to load contacts' });
    } finally {
      set({ isLoading: false });
    }
  },

  addContact: async (email: string) => {
    set({ error: null });
    try {
      const token = await useAuthStore.getState().getValidAccessToken();
      const contact = await api.contacts.addContact(email, token);
      set((state) => ({ contacts: [...state.contacts, contact] }));
    } catch (error) {
      console.error('Failed to add contact:', error);
      throw error;
    }
  },

  removeContact: async (contactIdToRemove: string) => {
    set({ error: null });
    try {
      const token = await useAuthStore.getState().getValidAccessToken();
      await api.contacts.removeContact(contactIdToRemove, token);
      set((state) => ({
        contacts: state.contacts.filter((contact) => contact.id !== contactIdToRemove),
      }));
    } catch (error) {
      console.error('Failed to remove contact:', error);
      throw error;
    }
  },
}));
