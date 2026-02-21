"use client";

import { useCallback } from "react";
import { useLocalStorage } from "./use-local-storage";
import type { Bookmark } from "@/types/engagement";

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useLocalStorage<Bookmark[]>("mfe-bookmarks", []);

  const addBookmark = useCallback(
    (item: Omit<Bookmark, "savedAt">) => {
      setBookmarks((prev) => {
        if (prev.some((b) => b.ideaId === item.ideaId)) return prev;
        return [...prev, { ...item, savedAt: new Date().toISOString() }];
      });
    },
    [setBookmarks]
  );

  const removeBookmark = useCallback(
    (ideaId: string) => {
      setBookmarks((prev) => prev.filter((b) => b.ideaId !== ideaId));
    },
    [setBookmarks]
  );

  const isBookmarked = useCallback(
    (ideaId: string) => bookmarks.some((b) => b.ideaId === ideaId),
    [bookmarks]
  );

  return { bookmarks, addBookmark, removeBookmark, isBookmarked };
}
