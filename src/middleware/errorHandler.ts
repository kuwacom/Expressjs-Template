import { Request, Response, NextFunction } from 'express';
import { ApiError, ErrorCode } from '@/lib/apiError';
import logger from '@/services/logger';

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  void req;
  void next;

  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof ApiError) {
    if (err.isExpected) {
      logger.warn(`ApiError: ${err.code} - ${err.message}`);
    } else {
      logger.error(`ApiError: ${err.code}`, err);
    }

    res.status(err.statusCode).json(err.toResponse());
    return;
  }

  logger.error('Unexpected error', err);
  res.status(500).json({
    code: ErrorCode.INTERNAL_SERVER_ERROR,
    message: 'Internal server error',
  });
};
