import logger from '@/services/logger';
import prisma from '@/services/prisma';
import { Request, Response } from 'express';

// ユーザー登録
export const createUser = async (req: Request, res: Response) => {
  const { name } = req.body ?? {};

  try {
    const user = await prisma.user.create({
      data: {
        name,
      },
    });
    res.status(201).json(user);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'User registration failed' });
  }
};

// ユーザー取得
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};
