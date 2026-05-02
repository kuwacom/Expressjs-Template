import type { ZodIssue } from 'zod';

export const ErrorCode = {
  // リクエストの形式や入力値が不正な場合
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  // 指定したリソースが存在しない場合
  NOT_FOUND: 'NOT_FOUND',
  // 認証が必要、または認証情報が不正な場合
  UNAUTHORIZED: 'UNAUTHORIZED',
  // 認証済みだが操作する権限がない場合
  FORBIDDEN: 'FORBIDDEN',
  // 一意制約や状態競合で処理を完了できない場合
  CONFLICT: 'CONFLICT',
  // 想定外の例外などでサーバー側が失敗した場合
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export type ValidationErrorDetails = ZodIssue[];

type ValidationErrorResponse = {
  code: typeof ErrorCode.VALIDATION_ERROR;
  message: string;
  details: ValidationErrorDetails;
};

export type ErrorResponse = {
  code: Exclude<ErrorCode, typeof ErrorCode.VALIDATION_ERROR>;
  message: string;
};

export type ApiErrorResponse = ValidationErrorResponse | ErrorResponse;

/**
 * # ApiError
 * API レスポンスとして返せる情報を持つ共通エラー
 *
 * ### 特徴
 * - HTTP ステータスと ErrorCode を一元管理する
 * - 想定内エラーかどうかをログレベル判定に使える
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details?: ValidationErrorDetails;
  public readonly isExpected: boolean;

  public constructor(
    statusCode: number,
    code: ErrorCode,
    message: string,
    details?: ValidationErrorDetails,
    isExpected = true
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details =
      code === ErrorCode.VALIDATION_ERROR ? details : undefined;
    this.isExpected = isExpected;
  }

  /**
   * ### toResponse
   * クライアントへ返すエラーレスポンスを生成する
   *
   * @returns API 共通エラーレスポンス
   */
  public toResponse(): ApiErrorResponse {
    if (this.code === ErrorCode.VALIDATION_ERROR) {
      return {
        code: ErrorCode.VALIDATION_ERROR,
        message: this.message,
        details: this.details ?? [],
      };
    }

    return {
      code: this.code,
      message: this.message,
    };
  }
}

// ErrorCode ごとに受け取れる引数を固定して補完と型安全を両立する
// code に応じて必要な追加情報だけを渡せるようにして誤用を防ぐ
type ApiErrorArgs = {
  [ErrorCode.VALIDATION_ERROR]: [details: ValidationErrorDetails];
  [ErrorCode.NOT_FOUND]: [resource?: string];
  [ErrorCode.UNAUTHORIZED]: [];
  [ErrorCode.FORBIDDEN]: [];
  [ErrorCode.CONFLICT]: [message?: string];
  [ErrorCode.INTERNAL_SERVER_ERROR]: [message?: string];
};

type ApiErrorBuilderMap = {
  [K in ErrorCode]: (...args: ApiErrorArgs[K]) => ApiError;
};

// ErrorCode と ApiError の生成処理を 1 か所に集めて message や statusCode の揺れを防ぐ
// 追加の ErrorCode が増えてもここを見ればレスポンス方針を追えるようにする
const apiErrorBuilders: ApiErrorBuilderMap = {
  [ErrorCode.VALIDATION_ERROR]: (details: ValidationErrorDetails) =>
    new ApiError(
      400,
      ErrorCode.VALIDATION_ERROR,
      'Validation failed',
      details,
      true
    ),
  [ErrorCode.NOT_FOUND]: (resource = 'Resource') =>
    new ApiError(
      404,
      ErrorCode.NOT_FOUND,
      `${resource} not found`,
      undefined,
      true
    ),
  [ErrorCode.UNAUTHORIZED]: () =>
    new ApiError(401, ErrorCode.UNAUTHORIZED, 'Unauthorized', undefined, true),
  [ErrorCode.FORBIDDEN]: () =>
    new ApiError(403, ErrorCode.FORBIDDEN, 'Forbidden', undefined, true),
  [ErrorCode.CONFLICT]: (message = 'Conflict') =>
    new ApiError(409, ErrorCode.CONFLICT, message, undefined, true),
  [ErrorCode.INTERNAL_SERVER_ERROR]: (
    message = 'Internal server error'
  ) =>
    new ApiError(
      500,
      ErrorCode.INTERNAL_SERVER_ERROR,
      message,
      undefined,
      false
    ),
};

/**
 * ### apiError
 * ErrorCode に対応した共通 API エラーを生成する
 *
 * @param code - エラー種別
 * @param args - ErrorCode ごとに定義された追加引数
 * @returns 共通 API エラー
 */
export function apiError<K extends ErrorCode>(
  code: K,
  ...args: ApiErrorArgs[K]
): ApiError {
  const builder = apiErrorBuilders[code];
  return builder(...args);
}
