import { Request, Response, NextFunction } from 'express';
import { chatService } from '../services/chats.service';
import { AuthContext } from '../middlewares/auth'; // Ensure this matches actual auth middleware export

const createHttpError = (status: number, message: string) => {
    const err = new Error(message) as any;
    err.status = status;
    return err;
};

export const createDirectChat = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { userId1, userId2 } = req.body;
        const auth = (req as any).auth as AuthContext;

        if (!auth) {
            return next(createHttpError(401, 'Unauthorized'));
        }

        // Validate that the requester is one of the participants
        if (auth.userId !== userId1 && auth.userId !== userId2) {
            return next(createHttpError(403, 'You can only create chats for yourself'));
        }

        const targetId = auth.userId === userId1 ? userId2 : userId1;

        if (!targetId) {
            return next(createHttpError(400, 'Target user ID is required'));
        }

        const chatroom = await chatService.getOrCreateDirectChat(auth.userId, targetId);

        res.status(200).json({
            success: true,
            data: chatroom
        });
    } catch (err) {
        next(err);
    }
};

export const getMessages = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { chatId } = req.params;
        const { limit, offset } = req.query;
        const auth = (req as any).auth as AuthContext;

        if (!auth) {
            return next(createHttpError(401, 'Unauthorized'));
        }

        const messages = await chatService.getChatHistory(
            auth.userId,
            chatId,
            limit ? Number(limit) : 50,
            offset ? Number(offset) : 0
        );

        res.status(200).json({
            success: true,
            data: messages
        });
    } catch (err) {
        next(err);
    }
};

export const getUserChats = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const auth = (req as any).auth as AuthContext;

        if (!auth) {
            return next(createHttpError(401, 'Unauthorized'));
        }

        // Get user's direct chats
        const chats = await chatService.getUserChats(auth.userId, 'direct');

        res.status(200).json({
            success: true,
            data: chats
        });
    } catch (err) {
        next(err);
    }
};

export const sendMessage = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { chatId } = req.params;
        const { content, attachments } = req.body;
        const auth = (req as any).auth as AuthContext;

        if (!auth) {
            return next(createHttpError(401, 'Unauthorized'));
        }

        if (!content && (!attachments || attachments.length === 0)) {
            return next(createHttpError(400, 'Message must have content or attachments'));
        }

        const message = await chatService.sendMessage(
            auth.userId,
            chatId,
            content,
            attachments
        );

        res.status(201).json({
            success: true,
            data: message
        });
    } catch (err) {
        next(err);
    }
};
