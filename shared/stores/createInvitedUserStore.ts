import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';
import type { InvitedContact } from '../types/contacts';

export interface InvitedUser {
  roomId: string;
  contact: InvitedContact;
}

interface InvitedUserStore {
  invitedUser: InvitedUser | null;
}

export function createInvitedUserStore(storage: StateStorage) {
  return create<InvitedUserStore>()(
    persist(
      (): InvitedUserStore => ({
        invitedUser: null,
      }),
      {
        name: 'invited-user',
        storage: createJSONStorage(() => storage),
      }
    )
  );
}
