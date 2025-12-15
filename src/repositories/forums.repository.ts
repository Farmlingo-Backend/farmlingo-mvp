import { eq } from 'drizzle-orm';
import { db } from '../db/dbconfig';
import { forums, forum_posts, NewForum, NewForumPost, Forum, ForumPost } from '../db/schema';

export class ForumRepository {
    // --- Forums ---
    async findAll(limit: number, offset: number): Promise<Forum[]> {
        return await db.select().from(forums).limit(limit).offset(offset);
    }

    async findById(forumId: string): Promise<Forum | undefined> {
        const rows = await db.select().from(forums).where(eq(forums.forum_id, forumId)).limit(1);
        return rows[0];
    }

    async create(data: NewForum): Promise<Forum> {
        const [created] = await db.insert(forums).values(data).returning();
        return created;
    }

    async update(forumId: string, data: Partial<NewForum>): Promise<Forum | undefined> {
        const [updated] = await db
            .update(forums)
            .set({ ...data, updated_at: new Date() })
            .where(eq(forums.forum_id, forumId))
            .returning();
        return updated;
    }

    async delete(forumId: string): Promise<Forum | undefined> {
        const [deleted] = await db.delete(forums).where(eq(forums.forum_id, forumId)).returning();
        return deleted;
    }

    // --- Forum Posts ---
    async findPostsByForumId(forumId: string, limit: number, offset: number): Promise<ForumPost[]> {
        return await db
            .select()
            .from(forum_posts)
            .where(eq(forum_posts.forum_id, forumId))
            .limit(limit)
            .offset(offset);
    }

    async createPost(data: NewForumPost): Promise<ForumPost> {
        const [created] = await db.insert(forum_posts).values(data).returning();
        return created;
    }
}
