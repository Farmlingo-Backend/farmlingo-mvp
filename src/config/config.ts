import dotenv from 'dotenv';
import type ms from 'ms';

dotenv.config();

export const port: number = process.env.PORT ? Number(process.env.PORT) : 5003;
export const nodeEnv: string = process.env.NODE_ENV ?? 'development';
export const appName: string = process.env.APP_NAME ?? 'farmlingo-backend';
export const healthMessage: string = process.env.HEALTH_OK_MESSAGE ?? 'ok';
export const jwtSecret: string = process.env.JWT_SECRET_KEY ?? (() => { throw new Error('JWT_SECRET_KEY environment variable is required'); })();
export const jwtExpiresIn: ms.StringValue | number =
  (process.env.JWT_EXPIRES_IN as ms.StringValue | undefined) ?? ('1h' as ms.StringValue);

// Clerk configuration
export const clerkWebhookSecret: string = process.env.CLERK_WEBHOOK_SECRET ?? (() => { throw new Error('CLERK_WEBHOOK_SECRET environment variable is required'); })();
export const clerkPublishableKey: string = process.env.CLERK_PUBLISHABLE_KEY ?? (() => { throw new Error('CLERK_PUBLISHABLE_KEY environment variable is required'); })();
export const clerkSecretKey: string = process.env.CLERK_SECRET_KEY ?? (() => { throw new Error('CLERK_SECRET_KEY environment variable is required'); })();
