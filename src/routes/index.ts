import { Router } from 'express';
import v1Router from './v1';

const router = Router();

// v1のルート設定
router.use('/v1', v1Router);
router.use((req, res, next) => {
  res.status(403).end();
});

export default router;
