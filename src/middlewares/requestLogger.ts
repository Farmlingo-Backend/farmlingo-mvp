import { Request, Response, NextFunction } from 'express';
import * as logger from '../../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  logger.info(`${req.method} ${req.originalUrl} - from ${req.ip}`);
  next();
};
