'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  SendHorizontal,
  CloudUpload,
  MoreVertical,
  X,
  FileText,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { Post, Reply } from "@/lib/community";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { EditMessageModal } from "../chat/editMessage";
import { DeleteConfirmModal } from "../chat/deleteModal";

interface ReplyModalProps {
  post: Post;
  open: boolean;
  onClose: () => void;
  onSubmit: (text: string, file?: File) => void;
  onEditReply?: (postId: number, replyId: number | string, newText: string, newImages: string[]) => void;
  onDeleteReply?: (postId: number, replyId: number | string) => void;
}

export default function ReplyModal({ post, open, onClose, onSubmit, onEditReply, onDeleteReply }: ReplyModalProps) {
  const [replyText, setReplyText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // reply edit/delete state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingReply, setEditingReply] = useState<Reply | null>(null);
  const [deletingReply, setDeletingReply] = useState<Reply | null>(null);

  // Clean up object URLs on unmount or file change
  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (filePreview) URL.revokeObjectURL(filePreview);

    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      setFilePreview(URL.createObjectURL(file));
    } else {
      setFilePreview(null);
    }
  };

  const handleRemoveFile = () => {
    if (filePreview) URL.revokeObjectURL(filePreview);
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = () => {
    if (!replyText.trim() && !selectedFile) return;
    onSubmit(replyText, selectedFile ?? undefined);
    setReplyText("");
    handleRemoveFile();
    // onClose is called by Sheet via onOpenChange
  };

  const isDisabled = !replyText.trim() && !selectedFile;

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="right" className="w-[900px] p-0 border-l overflow-hidden">
        {/* HEADER */}
        <SheetHeader className="px-6 py-5 sticky top-0 bg-background z-20 border-b">
          <div className="flex justify-between items-start">
            <div>
              <SheetTitle className="text-lg font-semibold">Reply to post</SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground">
                Add a message or file
              </SheetDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        {/* INPUT SECTION */}
        <div className="px-6 py-4 border-b sticky top-[90px] bg-background z-10">
          {selectedFile ? (
            // File preview mode
            <div className="flex items-start gap-3 p-2 bg-muted rounded-md">
              {filePreview ? (
                <img
                  src={filePreview}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded"
                />
              ) : (
                <FileText className="w-6 h-6 text-muted-foreground" />
              )}
              <div className="flex-1">
                <p className="text-xs font-medium truncate">{selectedFile.name}</p>
                <Input
                  placeholder="Add a caption..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="mt-1 h-9 text-sm"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleRemoveFile}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            // Text-only mode
            <div className="flex items-center gap-2">
              <Input
                placeholder="Type your reply here..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 rounded-md"
              />
              <Button
                variant="ghost"
                size="icon"
                className="p-2 text-muted-foreground hover:text-primary"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Attach file"
              >
                <CloudUpload className="h-5 w-5" />
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isDisabled}
                className="gap-1"
              >
                Reply
                <SendHorizontal className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            accept="image/*,application/pdf,.doc,.docx"
          />

          {/* Submit button when file is selected */}
          {selectedFile && (
            <div className="mt-3">
              <Button
                onClick={handleSubmit}
                disabled={isDisabled}
                className="w-full"
              >
                Send Reply
              </Button>
            </div>
          )}
        </div>

        {/* REPLIES LIST */}
        <ScrollArea className="h-[calc(100%-160px)] px-6 py-4">
          <div className="text-xs text-muted-foreground font-semibold mb-3 text-center tracking-wider">
            REPLIES
          </div>

          {post.replies.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">No replies yet.</p>
          ) : (
            post.replies.map((reply) => (
              <Card key={reply.id} className="mb-4 shadow-sm border rounded-xl">
                <CardContent className="pt-4 pb-5 px-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>
                        {reply.user.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-sm">{reply.user.name}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                              {reply.user.role}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {reply.timestamp}
                            </span>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="h-7 w-7 p-1 text-muted-foreground rounded-full hover:bg-muted">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setEditingReply(reply); setIsEditModalOpen(true); }}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setDeletingReply(reply); setIsDeleteModalOpen(true); }}>
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <p className="mt-3 text-sm leading-relaxed">{reply.text}</p>

                      {reply.image && (
                        <img
                          src={reply.image}
                          alt="attachment"
                          className="mt-3 rounded-lg w-full max-h-40 object-cover"
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </ScrollArea>

        {/* Edit / Delete Modals for replies */}
        {editingReply && (
          <EditMessageModal
            isOpen={isEditModalOpen}
            onClose={() => { setIsEditModalOpen(false); setEditingReply(null); }}
            onSave={(newText, newImages) => {
              if (typeof onEditReply === "function") onEditReply(post.id, editingReply.id, newText, newImages);
              setIsEditModalOpen(false);
              setEditingReply(null);
            }}
            initialText={editingReply.text}
            initialImages={editingReply.image ? [editingReply.image] : []}
          />
        )}

        {deletingReply && (
          <DeleteConfirmModal
            isOpen={isDeleteModalOpen}
            onClose={() => { setIsDeleteModalOpen(false); setDeletingReply(null); }}
            onConfirm={() => {
              if (typeof onDeleteReply === "function") onDeleteReply(post.id, deletingReply.id);
              setIsDeleteModalOpen(false);
              setDeletingReply(null);
            }}
          />
        )}

      </SheetContent>
    </Sheet>
  );
}