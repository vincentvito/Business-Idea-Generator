// Hardcoded master switch — set to true for development without auth/DB
// When ready for production, flip to false (or remove and rely on env vars)
const HARDCODED_DEV_BYPASS = true;

export const AUTH_BYPASS_ENABLED =
  HARDCODED_DEV_BYPASS ||
  process.env.BYPASS_AUTH === "true" ||
  process.env.NEXT_PUBLIC_BYPASS_AUTH === "true";

export const BYPASS_USER = {
  id: "dev-user",
  email: "dev@localhost",
  name: "Dev User",
} as const;

export const BYPASS_TIER = "PRO" as const;
