"use client";

import { useCallback } from "react";
import { useLocalStorage } from "./use-local-storage";
import type { Vote } from "@/types/engagement";

export function useVotes() {
  const [votes, setVotes] = useLocalStorage<Vote[]>("mfe-votes", []);

  const upvote = useCallback(
    (ideaId: string) => {
      setVotes((prev) => {
        const existing = prev.find((v) => v.ideaId === ideaId);
        if (existing?.direction === "up") return prev.filter((v) => v.ideaId !== ideaId);
        return [...prev.filter((v) => v.ideaId !== ideaId), { ideaId, direction: "up" as const }];
      });
    },
    [setVotes]
  );

  const downvote = useCallback(
    (ideaId: string) => {
      setVotes((prev) => {
        const existing = prev.find((v) => v.ideaId === ideaId);
        if (existing?.direction === "down") return prev.filter((v) => v.ideaId !== ideaId);
        return [...prev.filter((v) => v.ideaId !== ideaId), { ideaId, direction: "down" as const }];
      });
    },
    [setVotes]
  );

  const getVote = useCallback(
    (ideaId: string) => votes.find((v) => v.ideaId === ideaId)?.direction ?? null,
    [votes]
  );

  return { votes, upvote, downvote, getVote };
}
