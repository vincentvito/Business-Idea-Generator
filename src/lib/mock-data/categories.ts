import { CATEGORIES } from "@/lib/constants";
import { getIdeasPool } from "./ideas-pool";
import { hash, seededRange } from "./helpers";
import type { CategoryStats } from "@/types/trending";

const TOP_NICHES: Record<string, string> = {
  "Fitness & Wellness": "AI Personal Training",
  "Food & Beverage": "Meal Kit Delivery",
  "E-commerce & Retail": "Niche DTC Brands",
  "SaaS & Software": "AI-Powered Micro-SaaS",
  "Education & Training": "Online Cohort Courses",
  "Health & Medical": "Telehealth Platforms",
  "Real Estate": "PropTech Analytics",
  "Finance & Fintech": "Embedded Finance",
  "Travel & Hospitality": "Experience Marketplaces",
  "Beauty & Personal Care": "Clean Beauty DTC",
  "Pet Services": "Pet Health Tech",
  "Home Services": "On-Demand Handyman",
  "Sustainability & Green": "Carbon Offset Platforms",
  "Entertainment & Media": "Creator Economy Tools",
  "Childcare & Parenting": "EdTech for Toddlers",
  "Professional Services": "AI Legal Assistants",
  "Automotive": "EV Charging Networks",
  "Fashion & Apparel": "Sustainable Fashion Rental",
  "Agriculture & Food Tech": "Vertical Farming",
  "Social Impact": "Impact Investing Tools",
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
