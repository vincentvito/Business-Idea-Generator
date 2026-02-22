"use client";

import { useSession } from "next-auth/react";
import { AUTH_BYPASS_ENABLED, BYPASS_USER, BYPASS_TIER } from "@/lib/auth/bypass-client";

export function useUser() {
  const { data: session, status } = useSession();

  if (AUTH_BYPASS_ENABLED) {
    return {
      user: BYPASS_USER as { id: string; email: string; name: string },
      tier: BYPASS_TIER,
      isAuthenticated: true,
      isLoading: false,
    };
  }

  return {
    user: session?.user ?? null,
    tier: ((session?.user as { tier?: string } | undefined)?.tier ?? "FREE") as
      | "FREE"
      | "PRO"
      | "BUSINESS",
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
  };
}
