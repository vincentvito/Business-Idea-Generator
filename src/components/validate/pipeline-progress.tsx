"use client";

import { memo, useEffect, useRef, useState } from "react";
import { Check, Loader2, Circle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Stage {
  id: string;
  label: string;
}

interface PipelineProgressProps {
  stages: Stage[];
  currentStage: string | null;
  completedStages: Set<string>;
  error: string | null;
  stageMessage?: string | null;
  progress?: number; // 0-100
}

export const PipelineProgress = memo(function PipelineProgress({
  stages,
  currentStage,
  completedStages,
  error,
  stageMessage,
  progress,
}: PipelineProgressProps) {
  const [elapsed, setElapsed] = useState(0);
  const durations = useRef<Map<string, number>>(new Map());
  const prevStage = useRef<string | null>(null);

  useEffect(() => {
    // When stage changes, record duration for the previous stage
    if (prevStage.current && prevStage.current !== currentStage) {
      durations.current.set(prevStage.current, elapsed);
    }
    prevStage.current = currentStage;
    setElapsed(0);

    if (!currentStage) return;

    const interval = setInterval(() => {
      setElapsed((s) => s + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [currentStage]);

  return (
    <div className="space-y-3">
      {stages.map((stage) => {
        const isCompleted = completedStages.has(stage.id);
        const isActive = stage.id === currentStage && !isCompleted;
        const isPending = !isCompleted && !isActive;
        const duration = durations.current.get(stage.id);

        return (
          <div key={stage.id} className="space-y-1.5">
            <div
              className={cn(
                "flex items-center gap-3 text-sm",
                isCompleted && "text-foreground",
                isActive && "text-foreground font-medium",
                isPending && "text-muted-foreground"
              )}
            >
              {isCompleted ? (
                <Check className="h-4 w-4 text-green-600 shrink-0" />
              ) : isActive ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
              ) : (
                <Circle className="h-4 w-4 shrink-0" />
              )}
              <span>{stage.label}</span>
              {isActive && elapsed > 0 && (
                <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                  {elapsed}s
                </span>
              )}
              {isCompleted && duration != null && (
                <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                  {duration}s
                </span>
              )}
            </div>

            {isActive && (
              <div className="ml-7 space-y-1.5">
                {stageMessage && (
                  <p className="text-xs text-muted-foreground">{stageMessage}</p>
                )}
                {progress != null && progress > 0 ? (
                  <Progress value={progress} className="h-1.5" />
                ) : (
                  <div className="h-1.5 w-full rounded-full bg-primary/20 overflow-hidden">
                    <div className="h-full w-1/3 rounded-full bg-primary animate-indeterminate" />
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
      {error && (
        <div className="mt-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  );
});
