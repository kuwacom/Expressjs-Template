import { Request, Response } from 'express';

/**
 * ### get
 * `/v1/test` を処理する
 *
 * @param req - Express リクエスト
 * @param res - Express レスポンス
 * @returns レスポンス送信完了
 */
export const get = async (req: Request, res: Response): Promise<void> => {
  void req;
  res.json({ message: 'Hello from /v1/test!' });
};
