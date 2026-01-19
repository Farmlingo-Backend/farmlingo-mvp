'use client';

import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ReplyTarget {
  id: number;
  sender: string;
  text: string;
}

interface ReplyBarProps {
  replyingTo: ReplyTarget;
  onCancel: () => void;
}

export default function ReplyBar({ replyingTo, onCancel }: ReplyBarProps) {
  if (!replyingTo) return null;

  const { sender, text } = replyingTo;

  return (
    // COMMENT: Use px-3 on mobile, px-4 on desktop; full-width with max-width constraint
    <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 rounded-lg border bg-muted mx-2 sm:mx-6">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-[13px] font-medium text-muted-foreground shrink-0">
          Replying to
        </span>
        <span className="text-[13px] font-semibold truncate">{sender}</span>
        <span className="text-[13px] text-muted-foreground truncate min-w-0">
          {text}
        </span>
      </div>

      <Button
        size="icon"
        variant="ghost"
        className="h-6 w-6 flex-shrink-0"
        onClick={onCancel}
        aria-label="Cancel reply"
      >
        <X className="h-3.5 w-3.5 text-muted-foreground" />
      </Button>
    </div>
  );
}