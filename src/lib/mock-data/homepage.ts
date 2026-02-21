import { getIdeasPool } from "./ideas-pool";
import { hash, seededRange } from "./helpers";

export const STATS_DATA = {
  ideasValidated: 12847,
  goldilocksFound: 2340,
  avgScore: 67,
  categoriesExplored: 20,
};

const FEED_ADJECTIVES = [
  "AI-powered", "sustainable", "on-demand", "subscription-based",
  "hyperlocal", "mobile-first", "B2B", "marketplace",
  "premium", "automated", "community-driven", "niche",
];

export function getLiveFeedItems() {
  const pool = getIdeasPool();
  // Pick every 5th idea to get variety across all score ranges
  const spread = Array.from({ length: 20 }, (_, i) => pool[i * 5]);
  return spread.map((idea, i) => ({
    idea: idea.title,
    score: idea.overallScore,
    verdict: idea.verdict,
    timeAgo: `${seededRange(hash(idea.id) + i, 1, 58)}m ago`,
    category: idea.category,
  }));
}

export function getIdeaOfTheDay() {
  const pool = getIdeasPool();
  const dayIndex = hash(new Date().toDateString()) % pool.length;
  return pool[dayIndex];
}

export const TRUST_SIGNALS = [
  {
    icon: "Database" as const,
    title: "Real Search Data",
    description: "Powered by Google Ads keyword metrics",
  },
  {
    icon: "Brain" as const,
    title: "AI-Powered Analysis",
    description: "Claude AI for deep competitive insights",
  },
  {
    icon: "Shield" as const,
    title: "Data-Driven Scores",
    description: "Quantified demand, competition & monetization",
  },
  {
    icon: "Zap" as const,
    title: "60-Second Results",
    description: "Full validation pipeline in under a minute",
  },
];

export { FEED_ADJECTIVES };
