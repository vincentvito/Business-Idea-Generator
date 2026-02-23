"use client";

// Must match HARDCODED_DEV_BYPASS in bypass.ts
const HARDCODED_DEV_BYPASS = false;

export const AUTH_BYPASS_ENABLED =
  HARDCODED_DEV_BYPASS ||
  process.env.NEXT_PUBLIC_BYPASS_AUTH === "true";

export const BYPASS_USER = {
  id: "dev-user",
  email: "dev@localhost",
  name: "Dev User",
} as const;

export const BYPASS_TIER = "PRO" as const;
