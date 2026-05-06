import { NextFunction, Request, Response } from 'express';
import { apiError, ErrorCode } from '@/lib/apiError';

/**
 * ### fallback
 * `/v1` 以外へのアクセスを拒否する
 *
 * @param req - Express リクエスト
 * @param res - Express レスポンス
 * @param next - 次のミドルウェア
 * @returns 次のミドルウェア呼び出し完了
 */
export const fallback = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  next(apiError(ErrorCode.FORBIDDEN));
};
