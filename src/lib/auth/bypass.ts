// Controlled via env vars: set BYPASS_AUTH=true or NEXT_PUBLIC_BYPASS_AUTH=true
const HARDCODED_DEV_BYPASS = false;

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
