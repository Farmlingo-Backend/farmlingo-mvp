
import { Request, Response, NextFunction } from 'express';
import { clerkClient } from '@clerk/clerk-sdk-node';

interface HttpError extends Error {
    status?: number;
}

const createHttpError = (status: number, message: string): HttpError => {
    const err = new Error(message) as HttpError;
    err.status = status;
    return err;
};

export interface ClerkAuthContext {
    clerkUserId: string;
    sessionId?: string;
}

/**
 * Middleware to authenticate requests using Clerk JWT tokens
 * Extracts and verifies the Clerk session token from Authorization header
 */
import { db } from '../db/dbconfig';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { AuthContext } from '../types/rbac';

/**
 * Middleware: Verify Clerk Token ONLY
 * Does NOT check if user exists in local DB.
 * Use this for sync endpoints.
 */
export const verifyClerkToken = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith('Bearer ')) {
            return next(createHttpError(401, 'Missing or invalid Authorization header'));
        }

        const token = authHeader.slice(7).trim();

        if (!token) {
            return next(createHttpError(401, 'No token provided'));
        }

        // Verify the token with Clerk
        let session: {
            sub: string;
            sid?: string;
            [key: string]: unknown;
        };
        try {
            // Verify the session token
            // Passing authorizedParties or strict issuer checks might fail on localhost loops
            // Simplifying verification to defaults which are usually sufficient
            session = await clerkClient.verifyToken(token);
        } catch (err) {
            console.error('Token verification failed:', err);
            return next(createHttpError(401, 'Invalid or expired token'));
        }

        if (!session?.sub) {
            return next(createHttpError(401, 'Invalid token payload'));
        }

        const clerkUserId = session.sub;

        // Attach Clerk context
        req.clerkAuth = {
            clerkUserId: clerkUserId,
            sessionId: session.sid, // Might be undefined depending on token type
        } as ClerkAuthContext;

        return next();
    } catch (err) {
        console.error('Clerk authentication error:', err);
        return next(err as Error);
    }
};

/**
 * Middleware: Require Database User
 * MUST be used AFTER verifyClerkToken.
 * Checks if the authenticated Clerk user exists in the local database.
 */
export const requireDbUser = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const clerkAuth = req.clerkAuth as ClerkAuthContext;

        if (!clerkAuth?.clerkUserId) {
            return next(createHttpError(401, 'Unauthorized - No Clerk token verified'));
        }

        const clerkUserId = clerkAuth.clerkUserId;

        // Look up user in database
        const rows = await db
            .select()
            .from(users)
            .where(eq(users.clerk_user_id, clerkUserId))
            .limit(1);

        const user = rows[0];

        if (!user) {
            return next(createHttpError(401, 'User not found in database. Please sync profile first.'));
        }

        if (!user.is_active) {
            return next(createHttpError(403, 'User account is inactive'));
        }

        // Attach internal Auth context
        req.auth = {
            userId: user.user_id,
            role: user.role, // Use role from DB
            email: user.email,
            clerk_user_id: user.clerk_user_id
        } as AuthContext;

        return next();
    } catch (err) {
        return next(err);
    }
};

/**
 * Middleware: Full Authentication (Token + DB User)
 * Combines verifyClerkToken and requireDbUser
 */
export const clerkAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    // Chain the middlewares manually
    await verifyClerkToken(req, res, (err) => {
        if (err) return next(err);
        requireDbUser(req, res, next);
    });
};
