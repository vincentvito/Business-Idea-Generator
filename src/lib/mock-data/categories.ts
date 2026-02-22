import { CATEGORIES } from "@/lib/constants";
import { getIdeasPool } from "./ideas-pool";
import { hash, seededRange } from "./helpers";
import type { CategoryStats } from "@/types/trending";

const TOP_NICHES: Record<string, string> = {
  "Restaurant & Dining": "Plant-Based Fine Dining",
  "Food Truck & Street Food": "Gourmet Fusion Trucks",
  "Bakery & Pastry": "Sourdough Micro-Bakeries",
  "Catering & Events": "Private Chef Experiences",
  "Ghost Kitchen & Delivery-Only": "Multi-Brand Virtual Kitchens",
  "Bar, Pub & Nightlife": "Zero-Alcohol Cocktail Bars",
  "Café & Coffee Shop": "Specialty Coffee & Coworking",
  "Meal Prep & Subscription": "Keto & Macro Meal Plans",
  "Beverage Brand": "Functional Mushroom Drinks",
  "Food Product & Packaged Goods": "Artisan Hot Sauce Lines",
  "Food Tech & SaaS": "AI Kitchen Management",
  "Grocery & Specialty Retail": "Zero-Waste Grocery Stores",
};

export function getCategoryStats(): CategoryStats[] {
  const pool = getIdeasPool();

  return CATEGORIES.map((category) => {
    const seed = hash(category);
    const categoryIdeas = pool.filter((i) => i.category === category);
    const totalIdeas = categoryIdeas.length > 0
      ? categoryIdeas.length * seededRange(seed, 3, 8)
      : seededRange(seed, 80, 450);
    const avgScore = categoryIdeas.length > 0
      ? Math.round(categoryIdeas.reduce((s, i) => s + i.overallScore, 0) / categoryIdeas.length)
      : seededRange(seed + 1, 45, 78);

    return {
      category,
      totalIdeas,
      avgScore,
      goldilocksCount: seededRange(seed + 2, 5, Math.floor(totalIdeas * 0.2)),
      topNiche: TOP_NICHES[category] ?? "Emerging Niche",
    };
  });
}
