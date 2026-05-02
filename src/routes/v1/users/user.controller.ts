import prisma from '@/services/prisma';
import {
  CreateUserBodySchema,
  UserListResponseSchema,
  UserResponseSchema,
} from '@/schemas/user';
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
  const responseBody = UserResponseSchema.parse({
    id: user.id,
    name: user.name,
    createdAt: user.created.toISOString(),
  });
  res.status(201).json(responseBody);
};

// ユーザー取得
export const getUsers = async (req: Request, res: Response) => {
  void req;
  const users = await prisma.user.findMany();
  const responseBody = UserListResponseSchema.parse(
    users.map((user) => ({
      id: user.id,
      name: user.name,
      createdAt: user.created.toISOString(),
    }))
  );
  res.json(responseBody);
};
