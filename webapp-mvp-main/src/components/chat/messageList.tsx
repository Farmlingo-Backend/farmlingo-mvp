'use client';

import { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import MessageBubble from './messageBubble';

type Props = {
  messages: any[];
  onReply: (msg: any) => void;
  onEdit?: (msgId: number | string, text: string, images: string[]) => void;
  onDelete?: (msgId: number | string) => void;
};

export default function MessageList({ messages, onReply, onEdit, onDelete }: Props) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <ScrollArea className="flex-1 px-4 py-6 space-y-6 bg-white">
      {messages.length === 0 ? (
        <div className="h-full flex items-center justify-center text-gray-400">
          No messages yet. Start the conversation!
        </div>
      ) : (
        messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            onReply={onReply}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      )}

      <div ref={messagesEndRef} />
    </ScrollArea>
  );
}
