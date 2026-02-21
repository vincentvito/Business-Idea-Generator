"use client";

import { Progress } from "@/components/ui/progress";

interface UsageMeterProps {
  used: number;
  limit: number;
  label: string;
}

export function UsageMeter({ used, limit, label }: UsageMeterProps) {
  if (limit === Infinity) return null;

  const percentage = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const isAtLimit = used >= limit;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={isAtLimit ? "font-medium text-red-600" : "text-muted-foreground"}>
          {used} / {limit}
        </span>
      </div>
      <Progress
        value={percentage}
        className={`h-2 ${isAtLimit ? "[&>div]:bg-red-500" : ""}`}
      />
    </div>
  );
}
