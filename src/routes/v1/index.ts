import { Router } from 'express';
import { apiError, ErrorCode } from '@/lib/apiError';
import testRouter from '@/routes/v1/test';
import usersRouter from '@/routes/v1/users';

const v1Router = Router();

// /v1/testのルート
v1Router.use('/test', testRouter);

// /v1/usersのルート
v1Router.use('/users', usersRouter);

v1Router.use((req, res, next) => {
  next(apiError(ErrorCode.NOT_FOUND));
});

export default v1Router;
