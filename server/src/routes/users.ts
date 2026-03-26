import { Router } from 'express';
import { requireAccessToken } from '../middleware/auth';
import { findUserByEmail } from '../services/users';
import { byEmailSchema } from '../schemas/users';

const router = Router();

router.get('/', requireAccessToken, async (req, res) => {
  const result = byEmailSchema.safeParse(req.query);
  if (!result.success) {
    return res.status(400).json({ error: 'invalid request', details: result.error.issues });
  }

  try {
    const user = await findUserByEmail(result.data.email);
    if (!user) {
      return res.status(404).json({ error: 'user not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('failed to find user:', error);
    res.status(500).json({ error: 'failed to find user' });
  }
});

export default router;
