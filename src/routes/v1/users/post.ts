import { Request, Response } from 'express';
import { apiError, ErrorCode } from '@/lib/apiError';
import { CreateUserBodySchema } from '@/schemas/user';
import prisma from '@/services/prisma';

/**
 * ### post
 * `/v1/users` を処理する
 *
 * @param req - Express リクエスト
 * @param res - Express レスポンス
 * @returns レスポンス送信完了
 */
export const post = async (req: Request, res: Response): Promise<void> => {
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
