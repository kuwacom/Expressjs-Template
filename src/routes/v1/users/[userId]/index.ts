import { Router } from 'express';
import { getUser } from './user.controller';

const userIdRouter = Router({ mergeParams: true });

// 指定したユーザーIDの取得エンドポイント
userIdRouter.get('/', getUser);

export default userIdRouter;
