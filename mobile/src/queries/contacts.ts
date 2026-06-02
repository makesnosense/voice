import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { api } from '../api';
import { useAuthStore } from '../stores/useAuthStore';
import type { Contact } from '../../../shared/types/contacts';

async function fetchContacts(): Promise<Contact[]> {
  const token = await useAuthStore.getState().getValidAccessToken();
  return api.contacts.getContacts(token);
}

export const contactsQueryOptions = queryOptions({
  queryKey: ['contacts'],
  queryFn: fetchContacts,
  staleTime: Infinity,
});

export function useRemoveContactMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contactId: string) => {
      const token = await useAuthStore.getState().getValidAccessToken();
      return api.contacts.removeContact(contactId, token);
    },
    onMutate: async contactId => {
      await queryClient.cancelQueries({
        queryKey: contactsQueryOptions.queryKey,
      });
      const previousContacts = queryClient.getQueryData<Contact[]>(
        contactsQueryOptions.queryKey,
      );
      queryClient.setQueryData<Contact[]>(
        contactsQueryOptions.queryKey,
        current => current?.filter(contact => contact.id !== contactId) ?? [],
      );
      return { previousContacts };
    },
    onError: (_error, _contactId, context) => {
      if (context?.previousContacts) {
        queryClient.setQueryData(
          contactsQueryOptions.queryKey,
          context.previousContacts,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: contactsQueryOptions.queryKey,
      });
    },
  });
}

export function useAddContactMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (email: string) => {
      const token = await useAuthStore.getState().getValidAccessToken();
      return api.contacts.addContact(email, token);
    },
    onSuccess: newContact => {
      queryClient.setQueryData<Contact[]>(
        contactsQueryOptions.queryKey,
        current => [...(current ?? []), newContact],
      );
    },
  });
}
