import { Router, Request, Response } from 'express';

const testRouter = Router();

// GET /v1/test のエンドポイント
testRouter.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello from /v1/test!' });
});

export default testRouter;
