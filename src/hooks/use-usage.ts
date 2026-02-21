"use client";

import { useState, useEffect, useCallback } from "react";

interface ActionUsage {
  used: number;
  limit: number;
}

interface UsageData {
  tier: string;
  validate: ActionUsage;
  discover: ActionUsage;
  enrich: ActionUsage;
}

export function useUsage() {
  const [data, setData] = useState<UsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/usage");
      if (res.ok) {
        setData(await res.json());
      }
    } catch {
      // Silently fail — user may not be authenticated
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { usage: data, isLoading, refresh };
}
