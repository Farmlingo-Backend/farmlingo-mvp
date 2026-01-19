'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, X, Clock } from 'lucide-react';

interface MembershipRequest {
  request_id: string;
  chatroom_id: string;
  user_id: string;
  requested_by?: string;
  message?: string;
  status: string;
  created_at: string;
}

interface PendingRequestsProps {
  chatroomId: string;
  isAdmin: boolean;
  onRequestUpdate?: () => void;
}

export function PendingRequests({ chatroomId, isAdmin, onRequestUpdate }: PendingRequestsProps) {
  const [requests, setRequests] = useState<MembershipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      loadPendingRequests();
    }
  }, [chatroomId, isAdmin]);

  const loadPendingRequests = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call to get pending requests
      // const response = await chatroomsApi.getPendingRequests(chatroomId);
      // setRequests(response.data);

      // Mock data for now
      setRequests([
        {
          request_id: '1',
          chatroom_id: chatroomId,
          user_id: 'user123',
          message: 'I would like to join this community!',
          status: 'pending',
          created_at: new Date().toISOString(),
        },
        {
          request_id: '2',
          chatroom_id: chatroomId,
          user_id: 'user456',
          requested_by: 'user789',
          message: 'Please add me to the group',
          status: 'pending',
          created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        },
      ]);
    } catch (err) {
      console.error('Failed to load pending requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      setProcessing(requestId);
      // TODO: Implement approve API call
      console.log('Approving request:', requestId);

      // Remove from local state
      setRequests(prev => prev.filter(r => r.request_id !== requestId));
      onRequestUpdate?.();
    } catch (err) {
      console.error('Failed to approve request:', err);
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      setProcessing(requestId);
      // TODO: Implement reject API call
      console.log('Rejecting request:', requestId);

      // Remove from local state
      setRequests(prev => prev.filter(r => r.request_id !== requestId));
      onRequestUpdate?.();
    } catch (err) {
      console.error('Failed to reject request:', err);
    } finally {
      setProcessing(null);
    }
  };

  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Pending Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Pending Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">
            No pending membership requests
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Pending Requests ({requests.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {requests.map((request) => (
          <div
            key={request.request_id}
            className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex items-start space-x-3 flex-1">
              <Avatar className="w-10 h-10">
                <AvatarImage src="" />
                <AvatarFallback>
                  {request.user_id.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium">{request.user_id}</span>
                  <Badge variant="outline" className="text-xs">
                    {request.requested_by ? 'Invited' : 'Self-requested'}
                  </Badge>
                </div>
                {request.message && (
                  <p className="text-sm text-gray-600 mb-2">{request.message}</p>
                )}
                <p className="text-xs text-gray-500">
                  Requested {new Date(request.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={() => handleRejectRequest(request.request_id)}
                disabled={processing === request.request_id}
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                onClick={() => handleApproveRequest(request.request_id)}
                disabled={processing === request.request_id}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}