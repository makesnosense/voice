import type { Contact } from '../types/contacts';

export const sortContactsWithMobileFirst = (contacts: Contact[]): Contact[] =>
  [...contacts].sort((a, b) => Number(b.hasMobileDevice) - Number(a.hasMobileDevice));
