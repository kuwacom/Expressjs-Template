import { Request, Response } from 'express';
import { apiError, ErrorCode } from '@/lib/apiError';
import { UserParamsSchema } from '@/schemas/user';
import prisma from '@/services/prisma';

/**
 * ### get
 * `/v1/users/:userId` を処理する
 *
 * @param req - Express リクエスト
 * @param res - Express レスポンス
 * @returns レスポンス送信完了
 */
export const get = async (req: Request, res: Response): Promise<void> => {
  const userParamsValidation = UserParamsSchema.safeParse(req.params);

  if (!userParamsValidation.success) {
    throw apiError(
      ErrorCode.VALIDATION_ERROR,
      userParamsValidation.error.issues
    );
  }

  const { userId } = userParamsValidation.data;
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw apiError(ErrorCode.NOT_FOUND, 'User');
  }

  res.json(user);
};
