import { getIdeasPool } from "./ideas-pool";
import { hash, seededRange } from "./helpers";

export const STATS_DATA = {
  ideasValidated: 12847,
  goldilocksFound: 2340,
  avgScore: 67,
  categoriesExplored: 12,
};

const FEED_ADJECTIVES = [
  "farm-to-table", "artisan", "organic", "delivery-first",
  "plant-based", "locally-sourced", "ghost kitchen", "meal-prep",
  "gluten-free", "craft", "gourmet", "seasonal",
];

export function getLiveFeedItems() {
  const pool = getIdeasPool();
  // Pick every 4th idea to get variety across all score ranges
  const step = Math.max(1, Math.floor(pool.length / 20));
  const spread = Array.from({ length: Math.min(20, pool.length) }, (_, i) => pool[i * step]).filter(Boolean);
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
    title: "Food Industry AI",
    description: "Claude AI tuned for food & beverage analysis",
  },
  {
    icon: "Shield" as const,
    title: "Data-Driven Scores",
    description: "Quantified demand, competition & food market fit",
  },
  {
    icon: "Zap" as const,
    title: "60-Second Results",
    description: "Full food business validation in under a minute",
  },
];

export { FEED_ADJECTIVES };
