import { AnnouncementRepository } from '../repositories/announcements.repository';
import { NewAnnouncement } from '../db/schema';

interface HttpError extends Error {
    status?: number;
}

const createHttpError = (status: number, message: string): HttpError => {
    const err = new Error(message) as HttpError;
    err.status = status;
    return err;
};

export class AnnouncementService {
    private announcementRepository: AnnouncementRepository;

    constructor() {
        this.announcementRepository = new AnnouncementRepository();
    }

    /**
     * Create a new announcement
     * @param data - Announcement data
     * @returns Created announcement
     */
    async createAnnouncement(data: NewAnnouncement) {
        // Validate required fields
        if (!data.title || !data.title.trim()) {
            throw createHttpError(400, 'Title is required');
        }

        if (!data.content || !data.content.trim()) {
            throw createHttpError(400, 'Content is required');
        }

        if (!data.created_by) {
            throw createHttpError(400, 'Creator ID is required');
        }

        try {
            const announcement = await this.announcementRepository.create({
                title: data.title.trim(),
                content: data.content.trim(),
                created_by: data.created_by,
                is_active: data.is_active ?? true,
            });

            return announcement;
        } catch (error) {
            console.error('Error in createAnnouncement service:', error);
            throw createHttpError(500, 'Failed to create announcement');
        }
    }

    /**
     * Get announcement by ID
     * @param announcementId - Announcement UUID
     * @returns Announcement object
     */
    async getAnnouncementById(announcementId: string) {
        if (!announcementId) {
            throw createHttpError(400, 'Announcement ID is required');
        }

        try {
            const announcement = await this.announcementRepository.findById(announcementId);

            if (!announcement) {
                throw createHttpError(404, 'Announcement not found');
            }

            return announcement;
        } catch (error) {
            if ((error as HttpError).status) {
                throw error;
            }
            console.error('Error in getAnnouncementById service:', error);
            throw createHttpError(500, 'Failed to retrieve announcement');
        }
    }

    /**
     * Get all announcements with pagination
     * @param page - Page number (1-based)
     * @param limit - Items per page
     * @param activeOnly - Whether to return only active announcements
     * @returns Paginated result
     */
    async getAnnouncements(page: number = 1, limit: number = 10, activeOnly: boolean = true) {
        if (page < 1 || limit < 1 || limit > 100) {
            throw createHttpError(400, 'Invalid pagination parameters');
        }

        try {
            const offset = (page - 1) * limit;
            const announcements = await this.announcementRepository.findAll(limit, offset, activeOnly);
            const total = await this.announcementRepository.count(activeOnly);

            return {
                announcements,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
        } catch (error) {
            console.error('Error in getAnnouncements service:', error);
            throw createHttpError(500, 'Failed to retrieve announcements');
        }
    }

    /**
     * Update announcement
     * @param announcementId - Announcement UUID
     * @param data - Partial announcement data
     * @param userId - User ID making the update (for authorization)
     * @param isAdmin - Whether the user is admin
     * @returns Updated announcement
     */
    async updateAnnouncement(
        announcementId: string,
        data: Partial<NewAnnouncement>,
        userId: string,
        isAdmin: boolean = false
    ) {
        if (!announcementId) {
            throw createHttpError(400, 'Announcement ID is required');
        }

        try {
            // Get existing announcement to check ownership
            const existingAnnouncement = await this.announcementRepository.findById(announcementId);

            if (!existingAnnouncement) {
                throw createHttpError(404, 'Announcement not found');
            }

            // Check authorization: only creator or admin can update
            if (existingAnnouncement.created_by !== userId && !isAdmin) {
                throw createHttpError(403, 'Forbidden: You can only update your own announcements');
            }

            // Validate data
            const updateData: Partial<NewAnnouncement> = {};

            if (data.title !== undefined) {
                if (!data.title.trim()) {
                    throw createHttpError(400, 'Title cannot be empty');
                }
                updateData.title = data.title.trim();
            }

            if (data.content !== undefined) {
                if (!data.content.trim()) {
                    throw createHttpError(400, 'Content cannot be empty');
                }
                updateData.content = data.content.trim();
            }

            if (data.is_active !== undefined) {
                updateData.is_active = data.is_active;
            }

            const updatedAnnouncement = await this.announcementRepository.update(announcementId, updateData);

            return updatedAnnouncement;
        } catch (error) {
            if ((error as HttpError).status) {
                throw error;
            }
            console.error('Error in updateAnnouncement service:', error);
            throw createHttpError(500, 'Failed to update announcement');
        }
    }

    /**
     * Delete announcement (soft delete)
     * @param announcementId - Announcement UUID
     * @param userId - User ID making the delete request
     * @param isAdmin - Whether the user is admin
     * @returns Deleted announcement
     */
    async deleteAnnouncement(announcementId: string, userId: string, isAdmin: boolean = false) {
        if (!announcementId) {
            throw createHttpError(400, 'Announcement ID is required');
        }

        try {
            // Get existing announcement to check ownership
            const existingAnnouncement = await this.announcementRepository.findById(announcementId);

            if (!existingAnnouncement) {
                throw createHttpError(404, 'Announcement not found');
            }

            // Check authorization: only creator or admin can delete
            if (existingAnnouncement.created_by !== userId && !isAdmin) {
                throw createHttpError(403, 'Forbidden: You can only delete your own announcements');
            }

            const deletedAnnouncement = await this.announcementRepository.softDelete(announcementId);

            return deletedAnnouncement;
        } catch (error) {
            if ((error as HttpError).status) {
                throw error;
            }
            console.error('Error in deleteAnnouncement service:', error);
            throw createHttpError(500, 'Failed to delete announcement');
        }
    }

    /**
     * Get announcements by creator
     * @param creatorId - Creator user ID
     * @param page - Page number
     * @param limit - Items per page
     * @returns Paginated result
     */
    async getAnnouncementsByCreator(creatorId: string, page: number = 1, limit: number = 10) {
        if (!creatorId) {
            throw createHttpError(400, 'Creator ID is required');
        }

        if (page < 1 || limit < 1 || limit > 100) {
            throw createHttpError(400, 'Invalid pagination parameters');
        }

        try {
            const offset = (page - 1) * limit;
            const announcements = await this.announcementRepository.findByCreator(creatorId, limit, offset);
            const total = await this.announcementRepository.count();

            return {
                announcements,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
        } catch (error) {
            console.error('Error in getAnnouncementsByCreator service:', error);
            throw createHttpError(500, 'Failed to retrieve announcements by creator');
        }
    }
}

// Export singleton instance
export const announcementService = new AnnouncementService();
