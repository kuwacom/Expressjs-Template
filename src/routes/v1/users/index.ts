import { Router } from 'express';
import userIdRouter from './[userId]';
import { createUser, getUsers } from './user.controller';

const usersRouter = Router();

// ユーザー登録エンドポイント
usersRouter.post('/', createUser);

// ユーザー取得エンドポイント
usersRouter.get('/', getUsers);

// 指定したユーザーID配下のルート
usersRouter.use('/:userId', userIdRouter);

export default usersRouter;
