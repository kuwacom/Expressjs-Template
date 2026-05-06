import { Router } from 'express';
import userIdRouter from './[userId]';
import { get } from './get';
import { post } from './post';

const usersRouter = Router();

usersRouter.get('/', get);
usersRouter.post('/', post);
usersRouter.use('/:userId', userIdRouter);

export default usersRouter;
