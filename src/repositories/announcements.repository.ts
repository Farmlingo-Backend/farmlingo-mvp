import { eq, desc } from 'drizzle-orm';
import { db } from '../db/dbconfig';
import { announcements, Announcement, NewAnnouncement } from '../db/schema';

export class AnnouncementRepository {
    /**
     * Create a new announcement
     * @param data - Announcement data
     * @returns Created announcement
     */
    async create(data: NewAnnouncement): Promise<Announcement> {
        const [newAnnouncement] = await db
            .insert(announcements)
            .values(data)
            .returning();

        return newAnnouncement;
    }

    /**
     * Find announcement by ID
     * @param announcementId - Announcement UUID
     * @returns Announcement object or null if not found
     */
    async findById(announcementId: string): Promise<Announcement | null> {
        const rows = await db
            .select()
            .from(announcements)
            .where(eq(announcements.announcement_id, announcementId))
            .limit(1);

        return rows.length > 0 ? rows[0] : null;
    }

    /**
     * Get all announcements with pagination
     * @param limit - Maximum number of announcements to return
     * @param offset - Number of announcements to skip
     * @param activeOnly - Whether to return only active announcements
     * @returns Array of announcements
     */
    async findAll(
        limit: number = 50,
        offset: number = 0,
        activeOnly: boolean = true
    ): Promise<Announcement[]> {
        if (activeOnly) {
            const allAnnouncements = await db
                .select()
                .from(announcements)
                .where(eq(announcements.is_active, true))
                .orderBy(desc(announcements.created_at))
                .limit(limit)
                .offset(offset);

            return allAnnouncements;
        } else {
            const allAnnouncements = await db
                .select()
                .from(announcements)
                .orderBy(desc(announcements.created_at))
                .limit(limit)
                .offset(offset);

            return allAnnouncements;
        }
    }

    /**
     * Update announcement
     * @param announcementId - Announcement UUID
     * @param data - Partial announcement data to update
     * @returns Updated announcement object
     */
    async update(announcementId: string, data: Partial<NewAnnouncement>): Promise<Announcement> {
        const [updatedAnnouncement] = await db
            .update(announcements)
            .set({
                ...data,
                updated_at: new Date(),
            })
            .where(eq(announcements.announcement_id, announcementId))
            .returning();

        return updatedAnnouncement;
    }

    /**
     * Delete announcement (soft delete by setting is_active to false)
     * @param announcementId - Announcement UUID
     * @returns Updated announcement object
     */
    async softDelete(announcementId: string): Promise<Announcement> {
        const [deletedAnnouncement] = await db
            .update(announcements)
            .set({
                is_active: false,
                updated_at: new Date(),
            })
            .where(eq(announcements.announcement_id, announcementId))
            .returning();

        return deletedAnnouncement;
    }

    /**
     * Get announcements by creator
     * @param creatorId - Creator user ID
     * @param limit - Maximum number to return
     * @param offset - Number to skip
     * @returns Array of announcements
     */
    async findByCreator(
        creatorId: string,
        limit: number = 50,
        offset: number = 0
    ): Promise<Announcement[]> {
        const creatorAnnouncements = await db
            .select()
            .from(announcements)
            .where(eq(announcements.created_by, creatorId))
            .orderBy(desc(announcements.created_at))
            .limit(limit)
            .offset(offset);

        return creatorAnnouncements;
    }

    /**
     * Count total announcements
     * @param activeOnly - Whether to count only active announcements
     * @returns Total count
     */
    async count(activeOnly: boolean = true): Promise<number> {
        let query = db.$count(announcements);

        if (activeOnly) {
            query = db.$count(announcements, eq(announcements.is_active, true));
        }

        return await query;
    }
}
