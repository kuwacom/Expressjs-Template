import { NextFunction, Request, Response } from 'express';
import { apiError, ErrorCode } from '@/lib/apiError';

/**
 * ### fallback
 * `/v1` 配下の未定義 route を 404 として扱う
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
  next(apiError(ErrorCode.NOT_FOUND));
};
