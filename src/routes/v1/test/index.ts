import { Router, Request, Response } from 'express';
import { TestResponseSchema } from '@/schemas/test';

const testRouter = Router();

// GET /v1/test のエンドポイント
testRouter.get('/', (req: Request, res: Response) => {
  void req;
  const responseBody = TestResponseSchema.parse({
    message: 'Hello from /v1/test!',
  });
  res.json(responseBody);
});

export default testRouter;
