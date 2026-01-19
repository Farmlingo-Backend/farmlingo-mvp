'use client';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, CheckCheck } from "lucide-react";
import * as React from "react";

export interface Chat {
  id: number;
  name: string;
  avatar: string;
}

export interface Message {
  id: number | string;
  text?: string;
  images?: string[];
  file?: string | null;
  time?: string;
  isSent?: boolean;
}

interface ChatSidebarProps {
  chats: Chat[];
  selectedChatId: number;
  chatMessages: Record<number, Message[]>;
  onSelectChat: (chat: Chat) => void;
}

export default function ChatSidebar({
  chats,
  selectedChatId,
  chatMessages,
  onSelectChat,
}: ChatSidebarProps) {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <div className={`flex h-full flex-col border-r bg-background ${isMobile ? 'w-full' : 'w-[330px]'}`}>
      <div className="flex items-center gap-2 px-3 py-3 sm:py-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search chat"
            className="pl-10 h-9 rounded-md text-sm focus-visible:ring-0 focus-visible:ring-offset-0 w-full"
          />
        </div>

        <div className="relative group flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-accent"
            aria-label="New Chat"
          >
            <Plus className="h-5 w-5" />
          </Button>

          {/* Tooltip hidden on mobile */}
          {!isMobile && (
            <span className="absolute top-full mb-2 left-1/3 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
              New Chat
            </span>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-1 px-2 py-2">
          {chats.map((chat) => {
            const isActive = chat.id === selectedChatId;
            const messages = chatMessages[chat.id] || [];
            const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

            let lastMessageText = "No messages yet";
            if (lastMessage) {
              if (lastMessage.text?.trim()) {
                lastMessageText = lastMessage.text.trim();
              } else if (lastMessage.images && lastMessage.images.length > 0) {
                lastMessageText = "📷 Photo";
              } else if (lastMessage.file) {
                lastMessageText = "📎 File";
              }
            }

            const time = lastMessage?.time || "";
            const unreadCount = 0;

            return (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat)}
                className={`flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-colors min-h-[72px] ${
                  isActive ? "bg-accent" : "hover:bg-accent/50"
                }`}
              >
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarFallback className="text-xs">
                    {chat.avatar}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1 flex flex-col">
                  <div className="flex items-center justify-between w-full">
                    <span className="truncate text-[15px] font-medium flex-1">
                      {chat.name}
                    </span>
                    <span className="ml-2 whitespace-nowrap text-[11px] text-muted-foreground flex-shrink-0">
                      {time}
                    </span>
                  </div>

                  <div className="mt-0.5 flex items-center justify-between w-full">
                    <div className="flex items-center gap-1 min-w-0">
                      {lastMessage?.isSent && (
                        <CheckCheck className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <p className="text-sm text-muted-foreground truncate">
                        {lastMessageText}
                      </p>
                    </div>

                    {unreadCount > 0 && (
                      <Badge className="rounded-full px-2 py-0 text-[10px] font-medium flex-shrink-0">
                        {unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}