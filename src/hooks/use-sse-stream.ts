"use client";

import { useState, useCallback, useRef } from "react";
import type { PipelineEvent } from "@/types/pipeline";

export type ErrorType = "auth_required" | "usage_limit" | "generic";

export interface UsageErrorData {
  used: number;
  limit: number;
  tier: string;
}

export interface SSEStreamState<TResult> {
  isRunning: boolean;
  currentStage: string | null;
  stageMessage: string | null;
  progress: number;
  events: PipelineEvent[];
  completedStages: Map<string, unknown>;
  stageWarnings: Map<string, string>;
  result: TResult | null;
  error: string | null;
  errorType: ErrorType | null;
  usageData: UsageErrorData | null;
}

export function useSSEStream<TInput, TResult>(
  url: string,
  transformResult: (events: PipelineEvent[]) => TResult
) {
  const [state, setState] = useState<SSEStreamState<TResult>>({
    isRunning: false,
    currentStage: null,
    stageMessage: null,
    progress: 0,
    events: [],
    completedStages: new Map(),
    stageWarnings: new Map(),
    result: null,
    error: null,
    errorType: null,
    usageData: null,
  });
  const abortRef = useRef<AbortController | null>(null);
  const pendingEventsRef = useRef<PipelineEvent[]>([]);
  const rafRef = useRef<number>(0);

  const flushEvents = useCallback(() => {
    const batch = pendingEventsRef.current;
    if (batch.length === 0) return;
    pendingEventsRef.current = [];

    setState((prev) => {
      const events = [...prev.events, ...batch];
      const completedStages = new Map(prev.completedStages);
      const stageWarnings = new Map(prev.stageWarnings);
      let currentStage = prev.currentStage;
      let stageMessage = prev.stageMessage;
      let progress = prev.progress;
      let error = prev.error;

      for (const event of batch) {
        if (event.type === "stage_complete") {
          completedStages.set(event.stage, event.data);
          if (event.warning) {
            stageWarnings.set(event.stage, event.warning);
          }
        }
        if (event.type === "stage_start") {
          currentStage = event.stage;
          stageMessage = event.message;
        }
        if (event.type === "stage_progress") {
          progress = event.progress;
        }
        if (event.type === "error") {
          error = event.message;
        }
      }

      return {
        ...prev,
        events,
        completedStages,
        stageWarnings,
        currentStage,
        stageMessage,
        progress,
        error,
      };
    });
  }, []);

  const scheduleFlush = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      flushEvents();
    });
  }, [flushEvents]);

  const start = useCallback(
    async (input: TInput) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      pendingEventsRef.current = [];
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }

      setState({
        isRunning: true,
        currentStage: null,
        stageMessage: null,
        progress: 0,
        events: [],
        completedStages: new Map(),
        stageWarnings: new Map(),
        result: null,
        error: null,
        errorType: null,
        usageData: null,
      });

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
          signal: controller.signal,
        });

        if (!response.ok) {
          const text = await response.text();
          try {
            const errorData = JSON.parse(text);
            if (errorData.error === "auth_required") {
              setState((prev) => ({
                ...prev,
                isRunning: false,
                error: errorData.message,
                errorType: "auth_required" as const,
              }));
              return;
            }
            if (errorData.error === "usage_limit") {
              setState((prev) => ({
                ...prev,
                isRunning: false,
                error: errorData.message,
                errorType: "usage_limit" as const,
                usageData: {
                  used: errorData.used,
                  limit: errorData.limit,
                  tier: errorData.tier,
                },
              }));
              return;
            }
          } catch {
            // Not JSON — fall through to generic error
          }
          throw new Error(`HTTP ${response.status}: ${text}`);
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const json = line.slice(6);
            try {
              const event: PipelineEvent = JSON.parse(json);
              pendingEventsRef.current.push(event);
            } catch {
              // Skip malformed events
            }
          }

          if (pendingEventsRef.current.length > 0) {
            scheduleFlush();
          }
        }

        // Final flush of any remaining buffered events
        flushEvents();

        // Stream complete
        setState((prev) => ({
          ...prev,
          isRunning: false,
          result: transformResult(prev.events),
        }));
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        setState((prev) => ({
          ...prev,
          isRunning: false,
          error: err instanceof Error ? err.message : String(err),
        }));
      }
    },
    [url, transformResult, flushEvents, scheduleFlush]
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    setState((prev) => ({ ...prev, isRunning: false }));
  }, []);

  return { ...state, start, cancel };
}
