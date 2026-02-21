import type { Tier } from "@/generated/prisma/client";

interface PlanConfig {
  name: string;
  priceId: string;
  tier: Tier;
}

export const PLAN_MAP: Record<string, PlanConfig> = {
  PRO_MONTHLY: {
    name: "Pro Monthly",
    priceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
    tier: "PRO",
  },
  PRO_YEARLY: {
    name: "Pro Yearly",
    priceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID!,
    tier: "PRO",
  },
  BUSINESS_MONTHLY: {
    name: "Business Monthly",
    priceId: process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID!,
    tier: "BUSINESS",
  },
  BUSINESS_YEARLY: {
    name: "Business Yearly",
    priceId: process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID!,
    tier: "BUSINESS",
  },
};

export function getPriceId(tier: string, interval: string): string | null {
  const key = `${tier}_${interval === "year" ? "YEARLY" : "MONTHLY"}`;
  return PLAN_MAP[key]?.priceId ?? null;
}

export function getTierByPriceId(priceId: string): Tier | null {
  for (const plan of Object.values(PLAN_MAP)) {
    if (plan.priceId === priceId) return plan.tier;
  }
  return null;
}
