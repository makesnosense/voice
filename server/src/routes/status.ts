import { Router } from 'express';

const router = Router();

router.get('/health', (_req, res) => res.status(200).end());

router.get('/version', (_req, res) => {
  res.set('Cache-Control', 'public, max-age=43200');
  res.json({
    commit: process.env.DEPLOYED_COMMIT ?? null,
    deployedAt: process.env.DEPLOYED_AT ?? null,
  });
});

export default router;
