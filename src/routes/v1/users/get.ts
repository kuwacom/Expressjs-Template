import { Request, Response } from 'express';
import prisma from '@/services/prisma';

/**
 * ### get
 * `/v1/users` を処理する
 *
 * @param req - Express リクエスト
 * @param res - Express レスポンス
 * @returns レスポンス送信完了
 */
export const get = async (req: Request, res: Response): Promise<void> => {
  void req;
  const users = await prisma.user.findMany();
  res.json(users);
};
