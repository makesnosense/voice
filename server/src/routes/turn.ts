import { Router } from 'express';
import { generateTurnCredentials } from '../utils/generators';
import config from '../config';
import { turnCredentialsLimiter } from '../middleware/api-rate-limiters';
import { ERROR_CODE } from '../../../shared/constants/errors';

const router = Router();

router.get('/', turnCredentialsLimiter, (req, res) => {
  if (!config.turnSecret) {
    console.error('TURN credentials requested but TURN_SECRET is not configured');
    return res.status(500).json({
      errorMessage: 'TURN_SECRET is not configured on the server',
      errorCode: ERROR_CODE.INTERNAL_ERROR,
    });
  }
  const credentials = generateTurnCredentials(config.turnSecret);
  res.json(credentials);
});

export default router;
