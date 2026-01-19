import { Request, Response, NextFunction } from 'express';
import { membershipService } from '../services/membership.service';

interface HttpError extends Error {
  status?: number;
}

const createHttpError = (status: number, message: string): HttpError => {
  const err = new Error(message) as HttpError;
  err.status = status;
  return err;
};

function toNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const n = typeof value === 'string' ? Number(value) : (value as number);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Request to join a chatroom
 */
export const requestMembership = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).auth.userId;
    const { chatroomId } = req.params;
    const { message } = req.body;

    if (!chatroomId) {
      return next(createHttpError(400, 'Chatroom ID is required'));
    }

    const result = await membershipService.requestMembership({
      chatroomId,
      userId,
      message,
      requestedBy: userId // self-request
    });

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Approve or reject a membership request
 */
export const reviewMembershipRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const reviewerId = (req as any).auth.userId;
    const { requestId } = req.params;
    const { approved, responseMessage } = req.body;

    if (!requestId) {
      return next(createHttpError(400, 'Request ID is required'));
    }

    if (typeof approved !== 'boolean') {
      return next(createHttpError(400, 'Approved status must be boolean'));
    }

    const result = await membershipService.reviewMembershipRequest(
      requestId,
      reviewerId,
      approved,
      responseMessage
    );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Invite a user to join a chatroom
 */
export const inviteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const invitedBy = (req as any).auth.userId;
    const { chatroomId } = req.params;
    const { invitedUserId, invitedEmail, message, expiresAt } = req.body;

    if (!chatroomId) {
      return next(createHttpError(400, 'Chatroom ID is required'));
    }

    if (!invitedUserId && !invitedEmail) {
      return next(createHttpError(400, 'Either invitedUserId or invitedEmail is required'));
    }

    const result = await membershipService.inviteUser({
      chatroomId,
      invitedUserId,
      invitedEmail,
      invitedBy,
      message,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    });

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Accept an invitation
 */
export const acceptInvitation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).auth.userId;
    const { invitationCode } = req.params;

    if (!invitationCode) {
      return next(createHttpError(400, 'Invitation code is required'));
    }

    const result = await membershipService.acceptInvitation(invitationCode, userId);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Remove a member from chatroom
 */
export const removeMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const removerId = (req as any).auth.userId;
    const { chatroomId, userId } = req.params;
    const { reason } = req.body;

    if (!chatroomId || !userId) {
      return next(createHttpError(400, 'Chatroom ID and User ID are required'));
    }

    const result = await membershipService.removeMember(chatroomId, userId, removerId, reason);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get pending membership requests for a chatroom
 */
export const getPendingRequests = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).auth.userId;
    const { chatroomId } = req.params;

    if (!chatroomId) {
      return next(createHttpError(400, 'Chatroom ID is required'));
    }

    const requests = await membershipService.getPendingRequests(chatroomId, userId);

    res.status(200).json({
      success: true,
      data: requests
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get chatroom members
 */
export const getChatroomMembers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).auth.userId;
    const { chatroomId } = req.params;

    if (!chatroomId) {
      return next(createHttpError(400, 'Chatroom ID is required'));
    }

    const members = await membershipService.getChatroomMembers(chatroomId, userId);

    res.status(200).json({
      success: true,
      data: members
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Leave a chatroom
 */
export const leaveChatroom = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).auth.userId;
    const { chatroomId } = req.params;

    if (!chatroomId) {
      return next(createHttpError(400, 'Chatroom ID is required'));
    }

    // Remove self from chatroom
    const result = await membershipService.removeMember(chatroomId, userId, userId, 'User left voluntarily');

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};