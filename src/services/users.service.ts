import { clerkClient } from '@clerk/clerk-sdk-node';
import { UserRepository } from '../repositories/users.repository';

interface HttpError extends Error {
    status?: number;
}

const createHttpError = (status: number, message: string): HttpError => {
    const err = new Error(message) as HttpError;
    err.status = status;
    return err;
};

interface ClerkUserPayload {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
    phoneNumber?: string;
    createdAt?: string;
    updatedAt?: string;
}

export class UserService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    /**
     * Sync Clerk user profile
     * Validates payload and calls repository to upsert user
     * @param payload - Clerk user data from webhook
     * @returns Synced user object
     */
    /**
     * Sync Clerk user profile
     * Validates payload and calls repository to upsert user
     * @param payload - Clerk user data from webhook
     * @returns Synced user object
     */
    async syncClerkProfile(payload: ClerkUserPayload) {
        // Validate payload
        if (!payload.id || !payload.email) {
            throw createHttpError(400, 'Missing required fields: id and email');
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(payload.email)) {
            throw createHttpError(400, 'Invalid email format');
        }

        // Call repository to upsert user
        try {
            const user = await this.userRepository.upsertClerkUser(payload);
            return user;
        } catch (error) {
            console.error('Error in syncClerkProfile service:', error);
            throw error;
        }
    }

    /**
     * Lazy Sync: Fetch fresh data from Clerk and sync to DB
     * Securely fetches user data from Clerk backend SDK to avoid trusting frontend
     * @param clerkUserId - Clerk user ID
     * @returns Synced user object
     */
    async syncUserFromClerk(clerkUserId: string) {
        if (!clerkUserId) {
            throw createHttpError(400, 'Clerk User ID is required');
        }

        try {
            // 1. Fetch fresh user data securely from Clerk
            const clerkUser = await clerkClient.users.getUser(clerkUserId);

            // 2. Map Clerk data to our payload format
            const primaryEmail = clerkUser.emailAddresses.find(
                (e) => e.id === clerkUser.primaryEmailAddressId
            )?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress;

            if (!primaryEmail) {
                throw createHttpError(400, 'User has no email address in Clerk');
            }

            const payload: ClerkUserPayload = {
                id: clerkUser.id,
                email: primaryEmail,
                firstName: clerkUser.firstName || undefined,
                lastName: clerkUser.lastName || undefined,
                imageUrl: clerkUser.imageUrl || undefined,
                // Note: Schema doesn't currently support username or email_verified
                // We sync what we have mapping to existing schema
            };

            // 3. Upsert to database (Idempotent: Create or Update)
            const user = await this.userRepository.upsertClerkUser(payload);
            return user;

        } catch (error) {
            console.error('Error in syncUserFromClerk:', error);
            // Handle HTTP errors cleanly
            if ((error as any).status) throw error;
            if ((error as any).clerkError) {
                throw createHttpError(502, 'Failed to fetch user data from Clerk');
            }
            throw createHttpError(500, 'Failed to sync user from Clerk');
        }
    }

    /**
     * Get authenticated user by Clerk ID
     * Retrieves user from database or throws 404 error
     * @param clerkUserId - Clerk user ID
     * @returns User object
     */
    async getAuthenticatedUser(clerkUserId: string) {
        // Validate clerkUserId
        if (!clerkUserId || typeof clerkUserId !== 'string') {
            throw createHttpError(400, 'Invalid Clerk user ID');
        }

        // Call repository to find user by Clerk ID
        try {
            const user = await this.userRepository.findByClerkId(clerkUserId);

            if (!user) {
                throw createHttpError(404, 'User not found in database');
            }

            // Check if user is active
            if (!user.is_active) {
                throw createHttpError(403, 'User account is inactive or suspended');
            }

            return user;
        } catch (error) {
            // Re-throw if it's already an HTTP error
            if ((error as HttpError).status) {
                throw error;
            }

            console.error('Error in getAuthenticatedUser service:', error);
            throw createHttpError(500, 'Failed to retrieve user');
        }
    }

    /**
     * Delete user (soft delete)
     * Sets user as inactive when deleted from Clerk
     * @param clerkUserId - Clerk user ID
     * @returns Deleted user object
     */
    async deleteUser(clerkUserId: string) {
        // Validate clerkUserId
        if (!clerkUserId || typeof clerkUserId !== 'string') {
            throw createHttpError(400, 'Invalid Clerk user ID');
        }

        try {
            const user = await this.userRepository.softDeleteByClerkId(clerkUserId);

            if (!user) {
                throw createHttpError(404, 'User not found in database');
            }

            return user;
        } catch (error) {
            // Re-throw if it's already an HTTP error
            if ((error as HttpError).status) {
                throw error;
            }

            console.error('Error in deleteUser service:', error);
            throw createHttpError(500, 'Failed to delete user');
        }
    }
}


// Export singleton instance
export const userService = new UserService();
