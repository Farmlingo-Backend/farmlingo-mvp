import { Request } from 'express';
import { AuthContext } from '../middlewares/auth';
import { ClerkAuthContext } from '../middlewares/clerk';

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
      clerkAuth?: ClerkAuthContext;
    }
  }
}

// Export augmented Request type for explicit typing
export type AuthenticatedRequest = Request & {
  auth?: AuthContext;
  clerkAuth?: ClerkAuthContext;
};
