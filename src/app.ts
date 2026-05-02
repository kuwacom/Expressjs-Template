import express from 'express';
import env from '@/configs/env';
import cors from 'cors';
import { loggerMiddleware } from '@/middleware/logger';
import { errorHandler } from '@/middleware/errorHandler';
import router from '@/routes';

const app = express();

// cors 設定
app.use(cors({ origin: env.CORS_POLICY_ORIGIN }));

// ミドルウェア設定
app.use(express.json());
app.use(loggerMiddleware);

// ルーティング設定
app.use('/', router);
app.use(errorHandler);

export default app;
