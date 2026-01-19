import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'present' : 'missing');
console.log('CLERK_SECRET_KEY:', process.env.CLERK_SECRET_KEY ? 'present' : 'missing');

import { clerkClient } from '@clerk/clerk-sdk-node';
import { UserService } from './src/services/users.service';
import { clerkSecretKey } from './src/config/config';
import { logger } from './utils/logger';

// Initialize Clerk client with secret key
if (!clerkSecretKey) {
  throw new Error('CLERK_SECRET_KEY environment variable is required');
}

const userService = new UserService();

interface ClerkUser {
  id: string;
  email_addresses: Array<{
    id: string;
    email_address: string;
  }>;
  primary_email_address_id: string;
  first_name?: string;
  last_name?: string;
  image_url?: string;
  created_at: number;
  updated_at: number;
}

async function syncAllClerkUsers() {
  logger.info('Starting Clerk users sync to NeonDB...');

  let offset = 0;
  const limit = 100; // Clerk's max limit per request
  let totalSynced = 0;
  let hasMore = true;

  while (hasMore) {
    try {
      logger.info(`Fetching users from Clerk (offset: ${offset}, limit: ${limit})...`);

      // Fetch users from Clerk API
      const response = await fetch(
        `https://api.clerk.com/v1/users?limit=${limit}&offset=${offset}`,
        {
          headers: {
            'Authorization': `Bearer ${clerkSecretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Clerk API error: ${response.status} ${response.statusText}`);
      }

      const users: ClerkUser[] = await response.json();

      if (users.length === 0) {
        hasMore = false;
        break;
      }

      logger.info(`Fetched ${users.length} users from Clerk. Processing...`);

      // Process each user
      for (const clerkUser of users) {
        try {
          // Get primary email
          const primaryEmail = clerkUser.email_addresses.find(
            (e) => e.id === clerkUser.primary_email_address_id
          )?.email_address || clerkUser.email_addresses[0]?.email_address;

          if (!primaryEmail) {
            logger.warn(`Skipping user ${clerkUser.id}: No email address found`);
            continue;
          }

          // Prepare payload for our service
          const payload = {
            id: clerkUser.id,
            email: primaryEmail,
            firstName: clerkUser.first_name || undefined,
            lastName: clerkUser.last_name || undefined,
            imageUrl: clerkUser.image_url || undefined,
          };

          // Sync user to DB
          await userService.syncClerkProfile(payload);
          totalSynced++;

          logger.debug(`Synced user: ${clerkUser.id} (${primaryEmail})`);

        } catch (error) {
          logger.error(`Failed to sync user ${clerkUser.id}:`, error);
          // Continue with next user
        }
      }

      offset += limit;

      // Clerk's API might not return exactly 'limit' items when reaching the end
      if (users.length < limit) {
        hasMore = false;
      }

      // Small delay to be respectful to the API
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      logger.error('Error fetching users from Clerk:', error);
      throw error;
    }
  }

  logger.info(`Clerk users sync completed. Total users synced: ${totalSynced}`);
}

// Alternative method using Clerk SDK (if you prefer)
// async function syncAllClerkUsersSDK() {
//   logger.info('Starting Clerk users sync to NeonDB using SDK...');

//   let offset = 0;
//   const limit = 100;
//   let totalSynced = 0;
//   let hasMore = true;

//   while (hasMore) {
//     try {
//       // Use Clerk SDK to list users
//       const users = await clerkClient.users.getUserList({
//         limit,
//         offset,
//       });

//       if (users.length === 0) {
//         hasMore = false;
//         break;
//       }

//       for (const clerkUser of users) {
//         const primaryEmail = clerkUser.emailAddresses.find(
//           (e) => e.id === clerkUser.primaryEmailAddressId
//         )?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress;

//         if (!primaryEmail) continue;

//         const payload = {
//           id: clerkUser.id,
//           email: primaryEmail,
//           firstName: clerkUser.firstName || undefined,
//           lastName: clerkUser.lastName || undefined,
//           imageUrl: clerkUser.imageUrl || undefined,
//         };

//         await userService.syncClerkProfile(payload);
//         totalSynced++;
//       }

//       offset += limit;

//       if (users.length < limit) {
//         hasMore = false;
//       }

//     } catch (error) {
//       logger.error('Error in SDK sync:', error);
//       throw error;
//     }
//   }

//   logger.info(`SDK sync completed. Total users synced: ${totalSynced}`);
// }

// Run the sync
if (require.main === module) {
  syncAllClerkUsers()
    .then(() => {
      logger.info('Sync process finished successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Sync process failed:', error);
      process.exit(1);
    });
}

export { syncAllClerkUsers };
