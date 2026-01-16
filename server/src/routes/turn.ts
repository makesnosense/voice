import { Router } from 'express';
import { generateTurnCredentials } from '../utils/generators';
import config from '../config';

const router = Router();

router.get('/turn-credentials', (req, res) => {
  if (!config.turnSecret) {
    return res.status(500).json({ error: 'TURN server not configured' });
  }
  const credentials = generateTurnCredentials(config.turnSecret);
  res.json(credentials);
});

export default router;
