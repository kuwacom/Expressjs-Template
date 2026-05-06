import { Router } from 'express';
import { fallback } from '@/routes/v1/fallback';
import testRouter from '@/routes/v1/test';
import usersRouter from '@/routes/v1/users';

const v1Router = Router();

v1Router.use('/test', testRouter);
v1Router.use('/users', usersRouter);
v1Router.use(fallback);

export default v1Router;
