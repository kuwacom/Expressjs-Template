import logger from '@/services/logger';
import prisma from '@/services/prisma';
import { Request, Response } from 'express';

// 指定したユーザーIDの取得
export const getUser = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: Number(userId), // IDを数値に変換
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};
