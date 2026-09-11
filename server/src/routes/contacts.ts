import { Router, type Response } from 'express';
import { assertAuthed, requireAccessToken } from '../middleware/auth';
import { findUserByEmail } from '../services/users';
import { getContacts, getContact, addContact, removeContact } from '../services/contacts';
import { addContactSchema, contactIdSchema } from '../schemas/contacts';
import { ERROR_CODE } from '../../../shared/constants/errors';
import type { Contact } from '../../../shared/types/contacts';
import type { ApiErrorResponse } from '../../../shared/errors';

const router = Router();

router.get('/', requireAccessToken, async (req, res: Response<Contact[] | ApiErrorResponse>) => {
  assertAuthed(req);

  try {
    const userContacts = await getContacts(req.user.userId);
    res.json(userContacts);
  } catch (error) {
    console.error('failed to fetch contacts:', error);
    res
      .status(500)
      .json({ errorMessage: 'failed to fetch contacts', errorCode: ERROR_CODE.INTERNAL_ERROR });
  }
});

router.post('/', requireAccessToken, async (req, res: Response<Contact | ApiErrorResponse>) => {
  assertAuthed(req);

  const result = addContactSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      errorMessage: 'invalid email',
      errorCode: ERROR_CODE.INVALID_EMAIL,
      details: result.error.issues,
    });
  }

  const { email } = req.body;

  if (email === req.user.email) {
    return res
      .status(400)
      .json({ errorMessage: 'cannot add yourself', errorCode: ERROR_CODE.CANNOT_ADD_SELF });
  }

  try {
    const target = await findUserByEmail(email);
    if (!target) {
      return res
        .status(404)
        .json({ errorMessage: 'user not found', errorCode: ERROR_CODE.USER_NOT_FOUND });
    }

    const contact = await addContact(req.user.userId, target.id);
    if (!contact) {
      return res.status(409).json({
        errorMessage: 'already a contact',
        errorCode: ERROR_CODE.CONTACT_ALREADY_EXISTS,
      });
    }

    const contactWithDetails = await getContact(req.user.userId, target.id);
    if (!contactWithDetails) {
      console.error('contact added but could not be refetched:', {
        userId: req.user.userId,
        targetId: target.id,
      });
      return res
        .status(500)
        .json({ errorMessage: 'failed to add contact', errorCode: ERROR_CODE.INTERNAL_ERROR });
    }
    res.status(201).json(contactWithDetails);
  } catch (error) {
    console.error('failed to add contact:', error);
    res
      .status(500)
      .json({ errorMessage: 'failed to add contact', errorCode: ERROR_CODE.INTERNAL_ERROR });
  }
});

router.delete('/:contactId', requireAccessToken, async (req, res: Response<ApiErrorResponse>) => {
  assertAuthed(req);

  const paramResult = contactIdSchema.safeParse(req.params);
  if (!paramResult.success) {
    return res
      .status(400)
      .json({ errorMessage: 'invalid contact id', errorCode: ERROR_CODE.INVALID_REQUEST });
  }
  const { contactId } = paramResult.data;

  try {
    const removed = await removeContact(req.user.userId, contactId);
    if (!removed) {
      return res
        .status(404)
        .json({ errorMessage: 'contact not found', errorCode: ERROR_CODE.CONTACT_NOT_FOUND });
    }

    res.status(204).end();
  } catch (error) {
    console.error('failed to remove contact:', error);
    res
      .status(500)
      .json({ errorMessage: 'failed to remove contact', errorCode: ERROR_CODE.INTERNAL_ERROR });
  }
});

export default router;
