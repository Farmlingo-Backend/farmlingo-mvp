import { eq } from 'drizzle-orm';
import { db } from '../db/dbconfig';
import { users, User, NewUser } from '../db/schema';

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

export class UserRepository {
    /**
     * Upsert Clerk user
     * Creates a new user or updates existing user based on clerk_user_id or email
     * @param payload - Clerk user data
     * @returns User object
     */
    async upsertClerkUser(payload: ClerkUserPayload): Promise<User> {
        const { id, email, firstName, lastName, imageUrl, phoneNumber } = payload;

        // 1. Try to find user by clerk_user_id
        const existingByClerkId = await db
            .select()
            .from(users)
            .where(eq(users.clerk_user_id, id))
            .limit(1);

        if (existingByClerkId.length > 0) {
            // Update existing user found by Clerk ID
            const existingUser = existingByClerkId[0];

            const [updatedUser] = await db
                .update(users)
                .set({
                    email, // Update email in case it changed in Clerk
                    first_name: firstName || existingUser.first_name,
                    last_name: lastName || existingUser.last_name,
                    image_url: imageUrl || existingUser.image_url,
                    updated_at: new Date(),
                    last_login: new Date(),
                })
                .where(eq(users.clerk_user_id, id))
                .returning();

            return updatedUser;
        }

        // 2. If not found by Clerk ID, try to find by email
        const existingByEmail = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (existingByEmail.length > 0) {
            // Update existing user found by email (link accounts)
            const existingUser = existingByEmail[0];

            const [updatedUser] = await db
                .update(users)
                .set({
                    clerk_user_id: id, // Link the account
                    first_name: firstName || existingUser.first_name,
                    last_name: lastName || existingUser.last_name,
                    image_url: imageUrl || existingUser.image_url,
                    updated_at: new Date(),
                    last_login: new Date(),
                })
                .where(eq(users.email, email))
                .returning();

            return updatedUser;
        }

        // 3. Create new user
        const [newUser] = await db
            .insert(users)
            .values({
                clerk_user_id: id,
                email,
                first_name: firstName || null,
                last_name: lastName || null,
                image_url: imageUrl || null,
                last_login: new Date(),
                is_active: true,
            } as NewUser)
            .returning();

        return newUser;
    }

    /**
     * Find user by Clerk ID
     * Retrieves user from database by clerk_user_id
     * @param clerkUserId - Clerk user ID
     * @returns User object or null if not found
     */
    async findByClerkId(clerkUserId: string): Promise<User | null> {
        const rows = await db
            .select()
            .from(users)
            .where(eq(users.clerk_user_id, clerkUserId))
            .limit(1);

        return rows.length > 0 ? rows[0] : null;
    }

    /**
     * Find user by user ID
     * @param userId - User UUID
     * @returns User object or null if not found
     */
    async findById(userId: string): Promise<User | null> {
        const rows = await db
            .select()
            .from(users)
            .where(eq(users.user_id, userId))
            .limit(1);

        return rows.length > 0 ? rows[0] : null;
    }

    /**
     * Find user by email
     * @param email - User email
     * @returns User object or null if not found
     */
    async findByEmail(email: string): Promise<User | null> {
        const rows = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        return rows.length > 0 ? rows[0] : null;
    }

    /**
     * Get all users with pagination
     * @param limit - Maximum number of users to return
     * @param offset - Number of users to skip
     * @returns Array of users
     */
    async findAll(limit: number = 100, offset: number = 0): Promise<User[]> {
        const allUsers = await db
            .select()
            .from(users)
            .limit(limit)
            .offset(offset);

        return allUsers;
    }

    /**
     * Update user
     * @param userId - User UUID
     * @param data - Partial user data to update
     * @returns Updated user object
     */
    async update(userId: string, data: Partial<NewUser>): Promise<User> {
        const [updatedUser] = await db
            .update(users)
            .set({
                ...data,
                updated_at: new Date(),
            })
            .where(eq(users.user_id, userId))
            .returning();

        return updatedUser;
    }

    /**
     * Delete user (soft delete by setting is_active to false)
     * @param userId - User UUID
     * @returns Updated user object
     */
    async softDelete(userId: string): Promise<User> {
        const [deletedUser] = await db
            .update(users)
            .set({
                is_active: false,
                updated_at: new Date(),
            })
            .where(eq(users.user_id, userId))
            .returning();

        return deletedUser;
    }

    /**
     * Soft delete user by Clerk ID
     * @param clerkUserId - Clerk user ID
     * @returns Updated user object or null if not found
     */
    async softDeleteByClerkId(clerkUserId: string): Promise<User | null> {
        const rows = await db
            .update(users)
            .set({
                is_active: false,
                updated_at: new Date(),
            })
            .where(eq(users.clerk_user_id, clerkUserId))
            .returning();

        return rows.length > 0 ? rows[0] : null;
    }
}
