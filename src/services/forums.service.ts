import { ForumRepository } from '../repositories/forums.repository';
import { NewForum, NewForumPost, Forum, ForumPost } from '../db/schema';

export class ForumService {
    private forumRepo: ForumRepository;

    constructor() {
        this.forumRepo = new ForumRepository();
    }

    async getForums(page: number, limit: number): Promise<{ data: Forum[]; pagination: { page: number; limit: number } }> {
        const offset = (page - 1) * limit;
        const data = await this.forumRepo.findAll(limit, offset);
        return { data, pagination: { page, limit } };
    }

    async getForumById(forumId: string): Promise<Forum | undefined> {
        return await this.forumRepo.findById(forumId);
    }

    async createForum(data: NewForum): Promise<Forum> {
        return await this.forumRepo.create(data);
    }

    async updateForum(forumId: string, data: Partial<NewForum>): Promise<Forum | undefined> {
        return await this.forumRepo.update(forumId, data);
    }

    async deleteForum(forumId: string): Promise<Forum | undefined> {
        return await this.forumRepo.delete(forumId);
    }

    async getForumPosts(forumId: string, page: number, limit: number): Promise<{ data: ForumPost[]; pagination: { page: number; limit: number } }> {
        const offset = (page - 1) * limit;
        const data = await this.forumRepo.findPostsByForumId(forumId, limit, offset);
        return { data, pagination: { page, limit } };
    }

    async createForumPost(data: NewForumPost): Promise<ForumPost> {
        return await this.forumRepo.createPost(data);
    }
}

export const forumService = new ForumService();
