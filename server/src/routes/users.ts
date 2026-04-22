import { Router } from 'express';
import { requireAccessToken, requireRefreshToken } from '../middleware/auth';
import { findUserByEmail, deleteUser } from '../services/users';
import { byEmailSchema, updateNameSchema } from '../schemas/users';
import { updateUserName } from '../services/users';
import {
  updateNameLimiter,
  userLookupByEmailLimiter,
  deleteAccountLimiter,
} from '../middleware/api-rate-limiters';
import { reissueAccessTokenWithUpdatedName } from '../utils/jwt';

const router = Router();

router.get('/', requireAccessToken, userLookupByEmailLimiter, async (req, res) => {
  const result = byEmailSchema.safeParse(req.query);
  if (!result.success) {
    return res.status(400).json({ error: 'Invalid request', details: result.error.issues });
  }

  try {
    const user = await findUserByEmail(result.data.email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('failed to find user:', error);
    res.status(500).json({ error: 'failed to find user' });
  }
});

router.patch('/me', requireAccessToken, updateNameLimiter, async (req, res) => {
  const result = updateNameSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'invalid request', details: result.error.issues });
  }

  const user = req.user;
  const authHeader = req.headers.authorization;
  if (!user || !authHeader) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const rawToken = authHeader.substring(7);

  try {
    const updated = await updateUserName(user.userId, result.data.name);
    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    const accessToken = reissueAccessTokenWithUpdatedName(rawToken, updated.name);
    res.json({ accessToken });
  } catch (error) {
    console.error('Failed to update name:', error);
    res.status(500).json({ error: 'Failed to update name' });
  }
});

router.delete('/me', requireRefreshToken, deleteAccountLimiter, async (req, res) => {
  const { userId } = req.refreshPayload!;

  try {
    const deleted = await deleteUser(userId);
    if (!deleted) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`🗑️  deleted account: ${userId}`);
    res.status(204).end();
  } catch (error) {
    console.error('failed to delete account:', error);
    res.status(500).json({ error: 'failed to delete account' });
  }
});

export default router;
