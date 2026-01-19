'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { chatroomsApi } from '@/services/api';
import type { ChatroomMember } from '@/services/api';
import { Crown, Shield, User, UserPlus, Trash2 } from 'lucide-react';

interface MemberListProps {
  chatroomId: string;
  isAdmin: boolean;
  onMemberUpdate?: () => void;
}

const roleIcons = {
  admin: Crown,
  moderator: Shield,
  member: User,
};

const roleColors = {
  admin: 'bg-yellow-100 text-yellow-800',
  moderator: 'bg-blue-100 text-blue-800',
  member: 'bg-gray-100 text-gray-800',
};

export function MemberList({ chatroomId, isAdmin, onMemberUpdate }: MemberListProps) {
  const [members, setMembers] = useState<ChatroomMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    loadMembers();
  }, [chatroomId]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const response = await chatroomsApi.getChatroomMembers(chatroomId);
      setMembers(response.data);
    } catch (err) {
      console.error('Failed to load members:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail.trim()) return;

    try {
      setInviting(true);
      // TODO: Implement invite API call
      console.log('Inviting user:', inviteEmail, inviteMessage);
      setShowInviteDialog(false);
      setInviteEmail('');
      setInviteMessage('');
      onMemberUpdate?.();
    } catch (err) {
      console.error('Failed to invite user:', err);
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      // TODO: Implement remove member API call
      console.log('Removing member:', memberId);
      onMemberUpdate?.();
    } catch (err) {
      console.error('Failed to remove member:', err);
    }
  };

  const getRoleIcon = (role: string) => {
    const IconComponent = roleIcons[role as keyof typeof roleIcons] || User;
    return <IconComponent className="w-4 h-4" />;
  };

  const getRoleColor = (role: string) => {
    return roleColors[role as keyof typeof roleColors] || roleColors.member;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Members ({members.length})</h3>
        {isAdmin && (
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite New Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="invite-email">Email Address</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="user@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="invite-message">Invitation Message (Optional)</Label>
                  <Textarea
                    id="invite-message"
                    placeholder="Join our chatroom!"
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowInviteDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleInviteUser}
                    disabled={inviting || !inviteEmail.trim()}
                  >
                    {inviting ? 'Sending...' : 'Send Invitation'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-3">
        {members.map((member) => (
          <div
            key={member.member_id}
            className="flex items-center justify-between p-3 bg-white rounded-lg border"
          >
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src="" />
                <AvatarFallback>
                  {member.user_id.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{member.user_id}</span>
                  <Badge className={getRoleColor(member.role)} variant="secondary">
                    <div className="flex items-center space-x-1">
                      {getRoleIcon(member.role)}
                      <span className="capitalize">{member.role}</span>
                    </div>
                  </Badge>
                </div>
                <div className="text-sm text-gray-500">
                  Joined {new Date(member.joined_at).toLocaleDateString()}
                  {member.unread_count > 0 && (
                    <span className="ml-2 text-blue-600">
                      {member.unread_count} unread
                    </span>
                  )}
                </div>
              </div>
            </div>

            {isAdmin && member.role !== 'admin' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRemoveMember(member.member_id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
