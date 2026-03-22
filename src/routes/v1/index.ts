import { Router } from 'express';
import testRouter from './test';
import userRouter from './user';

const v1Router = Router();

// /v1/testのルート
v1Router.use('/test', testRouter);

// /v1/userのルート
v1Router.use('/user', userRouter);

v1Router.use((req, res, next) => {
  res.status(404).end();
});

export default v1Router;
