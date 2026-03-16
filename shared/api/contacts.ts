import { ApiBase } from './base';
import type { Contact } from '../types/contacts';

export class ContactsApi extends ApiBase {
  getContacts(accessToken: string): Promise<Contact[]> {
    return this.apiFetch<Contact[]>('/contacts', {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }

  addContact(email: string, accessToken: string): Promise<Contact> {
    return this.apiFetch<Contact>('/contacts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ email }),
    });
  }

  removeContact(contactId: string, accessToken: string): Promise<void> {
    return this.apiFetch(`/contacts/${contactId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }
}
