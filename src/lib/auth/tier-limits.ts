export const TIER_LIMITS = {
  FREE: {
    validate: 3,
    discover: 1,
    enrich: 0,
  },
  PRO: {
    validate: Infinity,
    discover: Infinity,
    enrich: Infinity,
  },
  BUSINESS: {
    validate: Infinity,
    discover: Infinity,
    enrich: Infinity,
  },
} as const;

export type TierName = keyof typeof TIER_LIMITS;
export type Action = keyof (typeof TIER_LIMITS)["FREE"];
