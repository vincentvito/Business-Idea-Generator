"use client";

import { useState } from "react";
import { getCommentsForIdea } from "@/lib/mock-data";
import { formatTimeAgo } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { MessageCircle, ThumbsUp, ChevronDown, ChevronUp } from "lucide-react";
import type { Comment } from "@/types/engagement";

function CommentItem({ comment, depth = 0 }: { comment: Comment; depth?: number }) {
  const [showReplies, setShowReplies] = useState(depth === 0);

  return (
    <div className={depth > 0 ? "ml-6 mt-2" : ""}>
      <div className="flex gap-2.5">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-full text-white text-xs font-bold shrink-0"
          style={{ backgroundColor: comment.avatarColor }}
        >
          {comment.author[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{comment.author}</span>
            <span className="text-xs text-muted-foreground">
              {formatTimeAgo(comment.createdAt)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{comment.content}</p>
          <div className="flex items-center gap-3 mt-1">
            <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <ThumbsUp className="h-3 w-3" /> {comment.likes}
            </button>
            {comment.replies.length > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                {showReplies ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
              </button>
            )}
          </div>
        </div>
      </div>
      {showReplies && comment.replies.map((reply) => (
        <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
      ))}
    </div>
  );
}

interface CommentSectionProps {
  ideaId: string;
}

export function CommentSection({ ideaId }: CommentSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const comments = getCommentsForIdea(ideaId);

  return (
    <div className="rounded-lg border bg-card p-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full text-left"
      >
        <MessageCircle className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">
          Discussion ({comments.reduce((acc, c) => acc + 1 + c.replies.length, 0)} comments)
        </span>
        {expanded ? (
          <ChevronUp className="h-4 w-4 ml-auto text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 ml-auto text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="mt-4 space-y-4">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}

          <div className="pt-3 border-t">
            <textarea
              placeholder="Add a comment..."
              className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground resize-none h-16"
            />
            <Button size="sm" className="mt-2">Post Comment</Button>
          </div>
        </div>
      )}
    </div>
  );
}
