'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MoreVertical, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import * as React from 'react';

export interface Chat {
  id: number;
  name: string;
  avatar: string;
}

interface ChatHeaderProps {
  selectedChat: Chat;
}

export default function ChatHeader({ selectedChat }: ChatHeaderProps) {
  const { name, avatar } = selectedChat;
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleBack = () => {
    navigate('/community/chats');
  };

  const hasImage = false;

  
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const isInsideChatThread =
    pathSegments.length === 3 &&
    pathSegments[0] === 'community' &&
    pathSegments[1] === 'chats' &&
    !isNaN(Number(pathSegments[2]));

  const showBackButton = isMobile && isInsideChatThread;

  return (
    <div className="flex items-center justify-between border-b bg-background p-4">
      <div className="flex items-center gap-3">
        {/* Back button — only on mobile in a chat */}
        {showBackButton && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 p-0 rounded-full hover:bg-accent"
            onClick={handleBack}
            aria-label="Back to chats"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}

        <div className="relative">
          <Avatar className="h-10 w-10">
            {hasImage && <AvatarImage src="" alt={name} />}
            <AvatarFallback className="text-xs">{avatar}</AvatarFallback>
          </Avatar>
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
        </div>

        <span className="font-semibold">{name}</span>
      </div>

      <Button variant="ghost" size="icon" aria-label="Chat options">
        <MoreVertical className="h-5 w-5" />
      </Button>
    </div>
  );
}