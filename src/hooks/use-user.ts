"use client";

import { useSession } from "next-auth/react";

export function useUser() {
  const { data: session, status } = useSession();

  if (process.env.NEXT_PUBLIC_BYPASS_AUTH === "true") {
    return {
      user: { id: "dev-user", email: "dev@localhost", name: "Dev User" },
      tier: "PRO" as const,
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
