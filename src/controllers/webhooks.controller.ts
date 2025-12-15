import { Request, Response, NextFunction } from 'express';
import { Webhook } from 'svix';
import { userService } from '../services/users.service';
import { clerkWebhookSecret } from '../config/config';

interface HttpError extends Error {
    status?: number;
}

const createHttpError = (status: number, message: string): HttpError => {
    const err = new Error(message) as HttpError;
    err.status = status;
    return err;
};

/**
 * Handle incoming Clerk webhook events
 * Verifies webhook signature and processes user events
 */
export const handleClerkWebhook = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Get the raw body (must be preserved for signature verification)
        const payload = req.body;

        // Get Svix headers for verification
        const svixId = req.headers['svix-id'] as string;
        const svixTimestamp = req.headers['svix-timestamp'] as string;
        const svixSignature = req.headers['svix-signature'] as string;

        // Verify required headers are present
        if (!svixId || !svixTimestamp || !svixSignature) {
            console.error('Missing Svix headers');
            return next(createHttpError(400, 'Missing webhook verification headers'));
        }

        // Verify webhook secret is configured
        if (!clerkWebhookSecret) {
            console.error('CLERK_WEBHOOK_SECRET is not configured');
            return next(createHttpError(500, 'Webhook secret not configured'));
        }

        // Create Svix webhook instance
        const wh = new Webhook(clerkWebhookSecret);

        let evt: any;

        try {
            // Verify the webhook signature
            evt = wh.verify(payload, {
                'svix-id': svixId,
                'svix-timestamp': svixTimestamp,
                'svix-signature': svixSignature,
            });
        } catch (err) {
            console.error('Webhook verification failed:', err);
            return next(createHttpError(400, 'Invalid webhook signature'));
        }

        // Extract event type and data
        const eventType = evt.type;
        const eventData = evt.data;

        console.log(`Received webhook event: ${eventType}`, {
            id: eventData.id,
            email: eventData.email_addresses?.[0]?.email_address
        });

        // Handle different event types
        switch (eventType) {
            case 'user.created':
            case 'user.updated':
                // Sync user profile to database
                await handleUserSync(eventData);
                break;

            case 'user.deleted':
                // Soft delete user from database
                await handleUserDeletion(eventData);
                break;

            default:
                console.log(`Unhandled webhook event type: ${eventType}`);
        }

        // Return success response
        res.status(200).json({
            success: true,
            message: 'Webhook processed successfully'
        });
    } catch (err) {
        console.error('Error processing webhook:', err);
        next(err);
    }
};

/**
 * Handle user.created and user.updated events
 * Syncs user data to the database
 */
async function handleUserSync(userData: any): Promise<void> {
    try {
        const payload = {
            id: userData.id,
            email: userData.email_addresses?.[0]?.email_address || '',
            firstName: userData.first_name || '',
            lastName: userData.last_name || '',
            imageUrl: userData.image_url || '',
            phoneNumber: userData.phone_numbers?.[0]?.phone_number || '',
        };

        // Validate required fields
        if (!payload.id || !payload.email) {
            console.error('Missing required user data:', payload);
            throw createHttpError(400, 'Missing required user data: id and email');
        }

        // Sync user to database
        const user = await userService.syncClerkProfile(payload);
        console.log(`User synced successfully: ${user.user_id}`);
    } catch (err) {
        console.error('Error syncing user:', err);
        throw err;
    }
}

/**
 * Handle user.deleted events
 * Soft deletes user from the database
 */
async function handleUserDeletion(userData: any): Promise<void> {
    try {
        const clerkUserId = userData.id;

        if (!clerkUserId) {
            console.error('Missing user ID in deletion event');
            throw createHttpError(400, 'Missing user ID');
        }

        // Soft delete user
        await userService.deleteUser(clerkUserId);
        console.log(`User deleted successfully: ${clerkUserId}`);
    } catch (err) {
        console.error('Error deleting user:', err);
        throw err;
    }
}
