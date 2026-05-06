import { Router } from 'express';
import { fallback } from '@/routes/fallback';
import v1Router from '@/routes/v1';

const routesRouter = Router();

routesRouter.use('/v1', v1Router);
routesRouter.use(fallback);

export default routesRouter;
