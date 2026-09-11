import type { Request, Response, NextFunction } from 'express';
import { ApiError, type ApiErrorResponse } from '../../../shared/errors';
import { ERROR_CODE } from '../../../shared/constants/errors';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response<ApiErrorResponse>,
  _next: NextFunction
) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      errorMessage: err.message,
      errorCode: err.errorCode ?? ERROR_CODE.INTERNAL_ERROR,
    });
  }

  console.error('Unhandled error:', err);
  res.status(500).json({
    errorMessage: 'Internal server error',
    errorCode: ERROR_CODE.INTERNAL_ERROR,
  });
}
