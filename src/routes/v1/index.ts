import { Router } from 'express';
import testRouter from './test';
import usersRouter from './users';

const v1Router = Router();

// /v1/testのルート
v1Router.use('/test', testRouter);

// /v1/usersのルート
v1Router.use('/users', usersRouter);

v1Router.use((req, res, next) => {
  res.status(404).end();
});

export default v1Router;
