import prisma from '@/services/prisma';
import { CreateUserBodySchema } from '@/schemas/user';
import { Request, Response } from 'express';
import { apiError, ErrorCode } from '@/lib/apiError';

// ユーザー登録
export const createUser = async (req: Request, res: Response) => {
  const createUserValidation = CreateUserBodySchema.safeParse(req.body);

  if (!createUserValidation.success) {
    throw apiError(
      ErrorCode.VALIDATION_ERROR,
      createUserValidation.error.issues
    );
  }

  const { name } = createUserValidation.data;

  const user = await prisma.user.create({
    data: {
      name,
    },
  });
  res.status(201).json(user);
};

// ユーザー取得
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  void req;
  const users = await prisma.user.findMany();
  res.json(users);
};
