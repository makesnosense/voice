export interface Contact {
  id: string;
  email: string;
  name: string | null;
  addedAt: string;
  hasMobileDevice: boolean;
}

export type InvitedContact = Pick<Contact, 'email' | 'name'>;
