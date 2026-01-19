import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PostActions } from "./postAction"
import type { Post } from "@/lib/community"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditMessageModal } from "../chat/editMessage";
import { DeleteConfirmModal } from "../chat/deleteModal";
import { useState } from "react";


"use client";

interface PostContentProps {
  post: Post
  onLike?: (postId: number) => void
  onReply?: (post: Post) => void
  onEdit?: (messageId: number | string, newText: string, newImages: string[]) => void;
  onDelete?: (messageId: number | string) => void;
}

export function PostContent({ post, onLike, onReply, onEdit, onDelete }: PostContentProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { text, image } = post;

  const handleEdit = (newText: string, newImages: string[]) => {
    if (onEdit) {
      onEdit(post.id, newText, newImages);
    }
    setIsEditModalOpen(false);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(post.id);
    }
    setIsDeleteModalOpen(false);
  };
  return (
    <>
      <div className="border rounded-xl p-4 space-y-3">
        <div className="flex justify-between">
          <div className="flex gap-3">
            <Avatar>
              <AvatarFallback>{post.user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{post.user.name}</p>
              <Badge variant="secondary">{post.user.role}</Badge>
              <p className="text-xs text-muted-foreground">{post.timestamp}</p>
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

        <p>{post.text}</p>

        {image && (
          <img src={image} className="rounded-lg max-h-80 object-cover w-full" />
        )}

        <PostActions post={post} onLike={onLike} onReply={onReply} />
      </div>

      <EditMessageModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleEdit}
        initialText={text || ""}
        initialImages={image ? [image] : []}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  )
}
