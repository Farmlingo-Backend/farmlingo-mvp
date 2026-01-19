"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircleDashed, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditMessageModal } from "../chat/editMessage";
import { DeleteConfirmModal } from "../chat/deleteModal";

export interface MessageReply {
  sender: string;
  text: string;
}

export interface Message {
  id: number | string;
  sender: string;
  role: string;
  avatar: string;
  time: string;
  text?: string;
  images?: string[];
  replyTo?: MessageReply;
  isSent: boolean;
}

interface MessageBubbleProps {
  msg: Message;
  onReply: (message: Message) => void;
  onEdit?: (messageId: number | string, newText: string, newImages: string[]) => void;
  onDelete?: (messageId: number | string) => void;
}

export default function MessageBubble({ msg, onReply, onEdit, onDelete }: MessageBubbleProps) {
  const { sender, role, avatar, time, text, images, replyTo, isSent } = msg;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleEdit = (newText: string, newImages: string[]) => {
    if (onEdit) {
      onEdit(msg.id, newText, newImages);
    }
    setIsEditModalOpen(false);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(msg.id);
    }
    setIsDeleteModalOpen(false);
  };

  return (
    <>
      <div className={`flex w-full ${isSent ? "justify-end" : "justify-start"} mb-4 px-2`}>
        <div className="max-w-[85vw] sm:max-w-[500px] w-full rounded-2xl border bg-background p-3 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="text-xs">{avatar}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold truncate">{sender}</span>
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 flex-shrink-0">
                    {role}
                  </Badge>
                </div>
                <span className="text-[11px] text-muted-foreground">{time}</span>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground h-7 w-7"
                  aria-label="Message options"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsDeleteModalOpen(true)}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {replyTo && (
            <div className="mb-2">
              <div className="flex items-start gap-2 rounded-md bg-muted p-2 text-[13px]">
                <span className="font-medium text-muted-foreground shrink-0">
                  {replyTo.sender}:
                </span>
                <span className="text-muted-foreground break-words">
                  {replyTo.text}
                </span>
              </div>
            </div>
          )}

          {text && (
            <p className="mb-2 text-[15px] leading-relaxed text-foreground break-words">
              {text}
            </p>
          )}

          {images && images.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-3">
              {images
                .map(img => img.trim())
                .filter(img => img.length > 0)
                .map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt="Attached content"
                    className="rounded-lg w-full h-32 object-cover"
                  />
                ))}
            </div>
          )}

          <div className="mt-2 flex justify-center">
            <Button
              variant="ghost"
              className="h-auto px-2 py-1 text-[13px] text-muted-foreground hover:bg-transparent"
              onClick={() => onReply(msg)}
              aria-label="Reply to message"
            >
              <MessageCircleDashed className="h-4 w-4" />
              <span className="ml-1">Reply</span>
            </Button>
          </div>
        </div>
      </div>

      <EditMessageModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleEdit}
        initialText={text || ""}
        initialImages={images || []}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}