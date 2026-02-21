import { getIdeasPool } from "./ideas-pool";
import type { LeaderboardIdea } from "@/types/leaderboard";

export interface LeaderboardFilters {
  category?: string;
  location?: string;
  timeRange?: "7d" | "30d" | "90d" | "all";
}

export function getLeaderboardIdeas(filters?: LeaderboardFilters): LeaderboardIdea[] {
  let ideas = getIdeasPool();

  if (filters?.category && filters.category !== "all") {
    ideas = ideas.filter((i) => i.category === filters.category);
  }

  if (filters?.location && filters.location !== "all") {
    ideas = ideas.filter((i) => i.location === filters.location);
  }

  if (filters?.timeRange && filters.timeRange !== "all") {
    const now = Date.now();
    const days = filters.timeRange === "7d" ? 7 : filters.timeRange === "30d" ? 30 : 90;
    const cutoff = now - days * 86400000;
    ideas = ideas.filter((i) => new Date(i.validatedAt).getTime() > cutoff);
  }

  return ideas.sort((a, b) => b.overallScore - a.overallScore);
}
