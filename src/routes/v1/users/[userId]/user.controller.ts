import prisma from '@/services/prisma';
import { UserParamsSchema } from '@/schemas/user';
import { Request, Response } from 'express';
import { apiError, ErrorCode } from '@/lib/apiError';

// 指定したユーザーIDの取得
export const getUser = async (req: Request, res: Response) => {
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
