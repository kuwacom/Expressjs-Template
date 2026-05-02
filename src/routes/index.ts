import { Router } from 'express';
import { apiError, ErrorCode } from '@/lib/apiError';
import v1Router from '@/routes/v1';

const router = Router();

// v1のルート設定
router.use('/v1', v1Router);
router.use((req, res, next) => {
  next(apiError(ErrorCode.FORBIDDEN));
});

export default router;
