'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageCircle, Send, CheckCircle } from 'lucide-react';
import { chatroomsApi } from '@/services/api';

interface JoinRequestProps {
  chatroomId: string;
  chatroomName: string;
  isMember: boolean;
  hasPendingRequest: boolean;
  onRequestSubmitted?: () => void;
}

export function JoinRequest({
  chatroomId,
  chatroomName,
  isMember,
  hasPendingRequest,
  onRequestSubmitted
}: JoinRequestProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitRequest = async () => {
    try {
      setSubmitting(true);
      await chatroomsApi.requestMembership(chatroomId, {
        message: message.trim() || undefined
      });

      setShowDialog(false);
      setMessage('');
      onRequestSubmitted?.();
    } catch (err) {
      console.error('Failed to submit membership request:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (isMember) {
    return (
      <div className="flex items-center text-green-600">
        <CheckCircle className="w-4 h-4 mr-2" />
        <span className="text-sm">You are a member</span>
      </div>
    );
  }

  if (hasPendingRequest) {
    return (
      <div className="flex items-center text-yellow-600">
        <MessageCircle className="w-4 h-4 mr-2" />
        <span className="text-sm">Request pending approval</span>
      </div>
    );
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <MessageCircle className="w-4 h-4 mr-2" />
          Request to Join
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request to Join {chatroomName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="request-message">Message (Optional)</Label>
            <Textarea
              id="request-message"
              placeholder="Introduce yourself and explain why you'd like to join..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">
              This message will be sent with your membership request.
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitRequest}
              disabled={submitting}
            >
              {submitting ? (
                'Submitting...'
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Request
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}