"use client";

import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVotes } from "@/hooks/use-votes";

interface VoteButtonsProps {
  ideaId: string;
  initialCount: number;
}

export function VoteButtons({ ideaId, initialCount }: VoteButtonsProps) {
  const { upvote, downvote, getVote } = useVotes();
  const current = getVote(ideaId);

  const offset = current === "up" ? 1 : current === "down" ? -1 : 0;
  const count = initialCount + offset;

  return (
    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => upvote(ideaId)}
        className={current === "up" ? "text-green-600" : "text-muted-foreground"}
      >
        <ThumbsUp className="h-3.5 w-3.5" />
      </Button>
      <span className="text-xs font-medium min-w-[20px] text-center">{count}</span>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => downvote(ideaId)}
        className={current === "down" ? "text-red-500" : "text-muted-foreground"}
      >
        <ThumbsDown className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
