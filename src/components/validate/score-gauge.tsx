"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";

interface ScoreGaugeProps {
  score: number;
  label: string;
  size?: "sm" | "lg";
}

function getScoreColor(score: number): string {
  if (score >= 75) return "text-green-600";
  if (score >= 50) return "text-yellow-600";
  if (score >= 25) return "text-orange-600";
  return "text-red-600";
}

function getScoreBgColor(score: number): string {
  if (score >= 75) return "bg-green-100";
  if (score >= 50) return "bg-yellow-100";
  if (score >= 25) return "bg-orange-100";
  return "bg-red-100";
}

export const ScoreGauge = memo(function ScoreGauge({ score, label, size = "sm" }: ScoreGaugeProps) {
  const isLarge = size === "lg";

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={cn(
          "flex items-center justify-center rounded-full font-bold",
          getScoreBgColor(score),
          getScoreColor(score),
          isLarge ? "h-20 w-20 text-2xl" : "h-14 w-14 text-lg"
        )}
      >
        {score}
      </div>
      <span
        className={cn(
          "font-medium text-center",
          isLarge ? "text-sm" : "text-xs"
        )}
      >
        {label}
      </span>
    </div>
  );
});
