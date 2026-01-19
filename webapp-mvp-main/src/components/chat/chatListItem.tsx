'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CheckCheck } from 'lucide-react';

export interface Chat {
  id: number;
  name: string;
  avatar: string;
}

interface ChatListItemProps {
  chat: Chat;
  active: boolean;
  lastMessageText: string;
  time: string;
  unread: number;
  showCheckmark: boolean;
  onClick: () => void;
}

export default function ChatListItem({
  chat,
  active,
  lastMessageText,
  time,
  unread,
  showCheckmark,
  onClick,
}: ChatListItemProps) {
  const displayText = lastMessageText || 'No messages yet';

  return (
    <div
      onClick={onClick}
      className={`flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-colors min-h-[72px] ${
        active ? 'bg-accent' : 'hover:bg-accent/50'
      }`}
    >
      <Avatar className="h-10 w-10 flex-shrink-0">
        <AvatarFallback className="text-xs">{chat.avatar}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1 flex flex-col">
        <div className="flex items-center justify-between w-full">
          <span className="truncate text-[15px] font-medium flex-1">{chat.name}</span>
          <span className="ml-2 whitespace-nowrap text-[11px] text-muted-foreground flex-shrink-0">
            {time}
          </span>
        </div>

        <div className="mt-0.5 flex items-center justify-between w-full">
          <div className="flex items-center gap-1 min-w-0">
            {showCheckmark && <CheckCheck className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
            {/* COMMENT: Use flex-1 + truncate on paragraph for dynamic width on mobile */}
            <p className="text-sm text-muted-foreground truncate">
              {displayText}
            </p>
          </div>

          {unread > 0 && (
            <Badge className="rounded-full px-2 py-0 text-[10px] font-medium flex-shrink-0">
              {unread}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}