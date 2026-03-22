import logger from '@/services/logger';
import env from '@/configs/env';
import app from '@/app';

app.listen(Number(env.PORT), env.HOST as string, (error) => {
  if (error) {
    throw error;
  }

  logger.info(`Server is running on: http://${env.HOST}:${env.PORT}`);
});
