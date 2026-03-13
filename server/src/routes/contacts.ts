import { Router } from 'express';
import { requireAccessToken } from '../middleware/auth';
import { findUserByEmail } from '../services/users';
import { getContacts, addContact, removeContact } from '../services/contacts';
import { addContactSchema, contactIdSchema } from '../schemas/contacts';

const router = Router();

router.get('/', requireAccessToken, async (req, res) => {
  const { userId } = req.user!;

  try {
    const userContacts = await getContacts(userId);
    res.json(userContacts);
  } catch (error) {
    console.error('failed to fetch contacts:', error);
    res.status(500).json({ error: 'failed to fetch contacts' });
  }
});

router.post('/', requireAccessToken, async (req, res) => {
  const result = addContactSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'invalid request', details: result.error.issues });
  }
  const { email } = req.body;

  const { userId, email: callerEmail } = req.user!;

  if (email === callerEmail) {
    return res.status(400).json({ error: 'cannot add yourself' });
  }

  try {
    const target = await findUserByEmail(email);
    if (!target) {
      return res.status(404).json({ error: 'user not found' });
    }

    const contact = await addContact(userId, target.id);
    if (!contact) {
      return res.status(409).json({ error: 'already a contact' });
    }

    res.status(201).json({ id: target.id, email: target.email, name: target.name });
  } catch (error) {
    console.error('failed to add contact:', error);
    res.status(500).json({ error: 'failed to add contact' });
  }
});

router.delete('/:contactId', requireAccessToken, async (req, res) => {
  const { userId } = req.user!;

  const paramResult = contactIdSchema.safeParse(req.params);
  if (!paramResult.success) {
    return res.status(400).json({ error: 'invalid contact id' });
  }
  const { contactId } = paramResult.data;

  try {
    const removed = await removeContact(userId, contactId);
    if (!removed) {
      return res.status(404).json({ error: 'contact not found' });
    }

    res.status(204).end();
  } catch (error) {
    console.error('failed to remove contact:', error);
    res.status(500).json({ error: 'failed to remove contact' });
  }
});

export default router;
