import { Router } from 'express';
import userIdRouter from './[userId]';
import { createUser, getUsers } from './user.controller';

const userRouter = Router();

// ユーザー登録エンドポイント
userRouter.post('/', createUser);

// ユーザー取得エンドポイント
userRouter.get('/', getUsers);

// 指定したユーザーID配下のルート
userRouter.use('/:userId', userIdRouter);

export default userRouter;
