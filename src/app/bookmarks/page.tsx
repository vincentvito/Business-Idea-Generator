"use client";

import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bookmark, Trash2, ArrowRight } from "lucide-react";

export default function BookmarksPage() {
  const { bookmarks, removeBookmark } = useBookmarks();

  return (
    <PageContainer>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Bookmark className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-2xl font-bold">Saved Ideas</h1>
        </div>
        <p className="text-muted-foreground">
          Ideas you&apos;ve bookmarked for later.
        </p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="text-center py-16">
          <Bookmark className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground mb-4">No bookmarks yet</p>
          <Button asChild variant="outline">
            <Link href="/top">
              Browse Top Ideas <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {bookmarks.map((b) => (
            <div key={b.ideaId} className="flex items-center gap-3 rounded-lg border bg-card p-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{b.ideaTitle}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">{b.category}</Badge>
                  <Badge className="text-xs bg-green-100 text-green-800">
                    Score: {b.score}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Saved {new Date(b.savedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => removeBookmark(b.ideaId)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
