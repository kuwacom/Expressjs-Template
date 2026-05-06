import { Router } from 'express';
import { get } from './get';

const testRouter = Router();

testRouter.get('/', get);

export default testRouter;
