import logger from '@/services/logger';
import prisma from '@/services/prisma';
import { UserParamsSchema } from '@/schemas/user';
import { Request, Response } from 'express';

// 指定したユーザーIDの取得
export const getUser = async (req: Request, res: Response) => {
  const userParamsValidation = UserParamsSchema.safeParse(req.params);

  if (!userParamsValidation.success) {
    res.status(400).json({
      error: 'Validation Error',
      details: userParamsValidation.error.issues,
    });
    return;
  }

  const { userId } = userParamsValidation.data;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
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
