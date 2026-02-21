"use client";

import { useSession } from "next-auth/react";

export function useUser() {
  const { data: session, status } = useSession();

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
