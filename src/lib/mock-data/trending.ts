import { CATEGORIES } from "@/lib/constants";
import { hash, seededRange, pickRandom } from "./helpers";
import type { TrendingNiche } from "@/types/trending";

const NICHE_NAMES: string[] = [
  "AI Personal Assistants", "Sustainable Packaging", "Remote Work Tools",
  "Plant-Based Proteins", "Home Fitness Equipment", "Electric Vehicle Charging",
  "Mental Health Apps", "Pet Tech", "Micro-SaaS", "Creator Economy Tools",
  "Senior Care Tech", "Urban Farming", "Subscription Commerce", "Voice AI",
  "Cybersecurity for SMBs", "Edtech for Adults", "Green Energy Consulting",
  "Telehealth Platforms", "Niche Communities", "AI Content Creation",
  "Smart Home Automation", "Meal Kit Delivery", "Digital Nomad Services",
  "Blockchain for Supply Chain", "Wellness Retreats", "Kids EdTech",
  "B2B Payments", "Climate Tech", "Personalized Nutrition", "Local Marketplaces",
  "AR/VR Experiences", "Drone Services", "Freelance Platforms",
  "Sleep Technology", "Food Waste Reduction",
];

const RELATED_KEYWORDS_POOL = [
  "best tools 2025", "market size", "startups", "trends",
  "growth rate", "investment", "opportunities", "platform",
  "software", "apps", "services", "solutions",
];

export function getTrendingNiches(): TrendingNiche[] {
  return NICHE_NAMES.map((name, i) => {
    const seed = hash(name);
    const baseVolume = seededRange(seed, 5000, 120000);
    const growthPercent = seededRange(seed + 1, -15, 80);

    const monthlyData: number[] = [];
    for (let m = 0; m < 12; m++) {
      const trend = baseVolume * (1 + (growthPercent / 100) * (m / 12));
      const noise = seededRange(seed + m + 100, -8, 8) / 100;
      monthlyData.push(Math.round(trend * (1 + noise)));
    }

    const compIdx = seededRange(seed + 2, 0, 100);

    return {
      id: `trend_${i}`,
      name,
      category: pickRandom(CATEGORIES, seed + 3),
      searchVolume: baseVolume,
      growthPercent,
      monthlyData,
      relatedKeywords: [
        `${name.toLowerCase().split(" ")[0]} ${RELATED_KEYWORDS_POOL[seed % RELATED_KEYWORDS_POOL.length]}`,
        `${name.toLowerCase()} ${RELATED_KEYWORDS_POOL[(seed + 1) % RELATED_KEYWORDS_POOL.length]}`,
        `${name.toLowerCase()} ${RELATED_KEYWORDS_POOL[(seed + 2) % RELATED_KEYWORDS_POOL.length]}`,
      ],
      competitionLevel: (compIdx < 33 ? "low" : compIdx < 66 ? "medium" : "high") as TrendingNiche["competitionLevel"],
      opportunity: (growthPercent > 20 ? "rising" : growthPercent > -5 ? "stable" : "declining") as TrendingNiche["opportunity"],
    };
  }).sort((a, b) => b.growthPercent - a.growthPercent);
}
