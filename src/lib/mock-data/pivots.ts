import { hash, seededRange } from "./helpers";
import type { PivotSuggestion } from "@/types/analysis";

const PIVOT_STRATEGIES = [
  { suffix: "for Enterprise", reason: "B2B customers have higher willingness to pay and longer retention" },
  { suffix: "as a Marketplace", reason: "Platform model creates network effects and reduces inventory risk" },
  { suffix: "with AI Automation", reason: "AI reduces operational costs and enables personalization at scale" },
  { suffix: "Subscription Model", reason: "Recurring revenue provides predictable cash flow and higher LTV" },
  { suffix: "in a Niche Vertical", reason: "Narrower focus means less competition and stronger product-market fit" },
  { suffix: "as a Mobile-First App", reason: "Mobile distribution is cheaper and enables location-based features" },
  { suffix: "with Community Focus", reason: "Community-driven growth reduces CAC and increases engagement" },
  { suffix: "as a White-Label Solution", reason: "B2B2C model leverages existing distribution channels" },
  { suffix: "for Remote Workers", reason: "Growing demographic with high spending power and digital-native behavior" },
];

export function getPivotSuggestions(ideaTitle: string, currentScore: number): PivotSuggestion[] {
  const seed = hash(ideaTitle);
  const pivots: PivotSuggestion[] = [];

  for (let i = 0; i < 3; i++) {
    const pSeed = seed + i * 13;
    const strategy = PIVOT_STRATEGIES[(pSeed) % PIVOT_STRATEGIES.length];
    const scoreBoost = seededRange(pSeed + 1, 8, 25);

    pivots.push({
      id: `pivot_${seed}_${i}`,
      pivotTitle: `${ideaTitle.split(" ").slice(0, 3).join(" ")} ${strategy.suffix}`,
      pivotOneLiner: `Pivot the core concept ${strategy.suffix.toLowerCase()} to capture a more profitable segment`,
      pivotReason: strategy.reason,
      estimatedScore: Math.min(95, currentScore + scoreBoost),
      category: "SaaS & Software",
    });
  }

  return pivots;
}
