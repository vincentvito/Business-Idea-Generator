"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookmarks } from "@/hooks/use-bookmarks";

interface BookmarkButtonProps {
  ideaId: string;
  ideaTitle: string;
  score: number;
  category: string;
}

export function BookmarkButton({ ideaId, ideaTitle, score, category }: BookmarkButtonProps) {
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();
  const saved = isBookmarked(ideaId);

  return (
    <Button
      variant="ghost"
      size="icon-xs"
      onClick={(e) => {
        e.stopPropagation();
        if (saved) {
          removeBookmark(ideaId);
        } else {
          addBookmark({ ideaId, ideaTitle, score, category });
        }
      }}
      title={saved ? "Remove bookmark" : "Bookmark this idea"}
    >
      {saved ? (
        <BookmarkCheck className="h-4 w-4 text-primary" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
    </Button>
  );
}
