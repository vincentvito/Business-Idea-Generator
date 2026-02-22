"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { DeepDiveData } from "@/types/deep-dive";

export function useDeepDive(id: string) {
  const [data, setData] = useState<DeepDiveData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const fetchDeepDive = useCallback(async () => {
    try {
      const res = await fetch(`/api/deep-dive/${id}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const result: DeepDiveData = await res.json();
      setData(result);

      // Stop polling when terminal state
      if (result.status === "COMPLETED" || result.status === "FAILED") {
        stopPolling();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, [id, stopPolling]);

  useEffect(() => {
    fetchDeepDive();

    // Poll every 3 seconds while generating
    intervalRef.current = setInterval(fetchDeepDive, 3000);

    return stopPolling;
  }, [fetchDeepDive, stopPolling]);

  return { data, isLoading, error, refetch: fetchDeepDive };
}
