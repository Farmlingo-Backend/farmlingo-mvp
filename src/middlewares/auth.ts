import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { eq } from 'drizzle-orm';

import { jwtSecret } from '../config/config';
import { db } from '../db/dbconfig';
import { users } from '../db/schema';

interface HttpError extends Error {
  status?: number;
}

const createHttpError = (status: number, message: string): HttpError => {
  const err = new Error(message) as HttpError;
  err.status = status;
  return err;
};

export interface AuthContext {
  userId: string;
  role?: string;
  email?: string;
  clerk_user_id?: string | null;
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization || '';

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(createHttpError(401, 'Missing or invalid Authorization header'));
    }

    const token = authHeader.slice(7).trim();

    let payload: (JwtPayload & { sub?: string; role?: string; email?: string; clerk_user_id?: string }) | null = null;

    try {
      payload = jwt.verify(token, jwtSecret) as JwtPayload & {
        sub?: string;
        role?: string;
        email?: string;
        clerk_user_id?: string;
      };
    } catch (err) {
      return next(createHttpError(401, 'Invalid or expired token'));
    }

    if (!payload?.sub) {
      return next(createHttpError(401, 'Invalid token payload'));
    }

    const userId = payload.sub as string;

    const rows = await db
      .select()
      .from(users)
      .where(eq(users.user_id, userId))
      .limit(1);

    const user = rows[0];

    if (!user) {
      return next(createHttpError(401, 'User not found for token'));
    }

    if (!user.is_active) {
      return next(createHttpError(403, 'User account is inactive'));
    }

    (req as any).auth = {
      userId,
      role: payload.role,
      email: payload.email ?? user.email,
      clerk_user_id: payload.clerk_user_id ?? user.clerk_user_id ?? null
    } as AuthContext;

    return next();
  } catch (err) {
    return next(err as Error);
  }
}
