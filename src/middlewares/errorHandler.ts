import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  status?: number;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction // eslint-disable-line @typescript-eslint/no-unused-vars
): void => {
  const status = err.status || 500;
  const payload: Record<string, unknown> = {
    message: err.message || 'Internal Server Error',
    status,
    timestamp: new Date().toISOString()
  };

  if (process.env.NODE_ENV !== 'production') {
    payload.stack = err.stack;
  }

  res.status(status).json(payload);
};
