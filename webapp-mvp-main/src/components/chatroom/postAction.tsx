import { ThumbsUp, MessageCircle, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Post } from "@/lib/community"

interface PostActionsProps {
  post: Post
  onLike?: (postId: number) => void
  onReply?: (post: Post) => void
}

export function PostActions({ post, onLike, onReply }: PostActionsProps) {
  return (
    <div className="flex gap-6 text-sm items-center">
      <Button variant={post.isLiked ? "secondary" : "ghost"} size="sm" onClick={() => onLike?.(post.id)}>
        <ThumbsUp className="mr-1" /> Like {post.likes > 0 ? `(${post.likes})` : null}
      </Button>
      <Button variant="ghost" size="sm" onClick={() => onReply?.(post)}>
        <MessageCircle className="mr-1" /> Reply ({post.replies.length})
      </Button>
      <Button variant="ghost" size="sm">
        <Share2 className="mr-1" /> Share
      </Button>
    </div>
  )
}
