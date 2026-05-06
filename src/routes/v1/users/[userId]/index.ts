import { Router } from 'express';
import { get } from './get';

const userIdRouter = Router({ mergeParams: true });

userIdRouter.get('/', get);

export default userIdRouter;
