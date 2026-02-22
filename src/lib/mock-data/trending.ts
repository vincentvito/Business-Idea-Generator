import { CATEGORIES } from "@/lib/constants";
import { hash, seededRange, pickRandom } from "./helpers";
import type { TrendingNiche } from "@/types/trending";

const NICHE_NAMES: string[] = [
  "Ghost Kitchen Concepts", "Plant-Based Fast Casual", "Meal Prep Delivery",
  "Artisan Bakery Subscriptions", "Specialty Coffee Roasting", "Food Truck Catering",
  "Farm-to-Table Dining", "Craft Cocktail Bars", "Vegan Comfort Food",
  "Ethnic Fusion Restaurants", "Healthy Snack Brands", "Cold Brew & Kombucha",
  "Food Waste Reduction Tech", "Cloud Kitchen Software", "Gourmet Meal Kits",
  "Late-Night Delivery Concepts", "Pet Food & Treats", "Functional Beverages",
  "Pop-Up Restaurant Events", "Smart Kitchen Tech", "Protein Snack Brands",
  "Bubble Tea & Boba Shops", "Food Hall Concepts", "Sustainable Packaging Foods",
  "Micro-Bakery & Cottage Food", "Private Chef Services", "Food Tour Experiences",
  "Fermented Foods & Probiotics", "Restaurant POS & Tech", "Specialty Grocery Retail",
  "Ice Cream & Gelato Shops", "Catering for Corporate Events", "Dark Store Grocery",
  "Kids Meal Subscription", "Hot Sauce & Condiment Brands",
];

const RELATED_KEYWORDS_POOL = [
  "near me", "market size", "startup costs", "trends",
  "growth rate", "franchise", "opportunities", "delivery",
  "menu ideas", "recipes", "suppliers", "equipment",
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
