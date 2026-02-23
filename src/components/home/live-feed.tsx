"use client";

import { useState, useEffect } from "react";
import { getLiveFeedItems } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

const items = getLiveFeedItems();

function verdictColor(verdict: string, isHero: boolean) {
  if (isHero) {
    switch (verdict) {
      case "strong": return "bg-green-500/20 text-green-200";
      case "promising": return "bg-yellow-500/20 text-yellow-200";
      case "risky": return "bg-orange-500/20 text-orange-200";
      default: return "bg-red-500/20 text-red-200";
    }
  }
  switch (verdict) {
    case "strong": return "bg-green-100 text-green-800";
    case "promising": return "bg-yellow-100 text-yellow-800";
    case "risky": return "bg-orange-100 text-orange-800";
    default: return "bg-red-100 text-red-800";
  }
}

interface LiveFeedProps {
  variant?: "default" | "hero";
}

export function LiveFeed({ variant = "default" }: LiveFeedProps) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const isHero = variant === "hero";

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const interval = setInterval(() => {
      setVisible(false);
      timeoutId = setTimeout(() => {
        setIndex((prev) => (prev + 1) % items.length);
        setVisible(true);
      }, 300);
    }, 3500);
    return () => {
      clearInterval(interval);
      clearTimeout(timeoutId);
    };
  }, []);

  const item = items[index];

  return (
    <div
      className={`mt-6 rounded-lg px-4 py-2.5 flex items-center gap-3 overflow-hidden ${
        isHero
          ? "border border-white/20 bg-white/10 backdrop-blur-sm"
          : "border bg-card"
      }`}
    >
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
      </span>
      <div
        className={`flex-1 flex items-center gap-2 flex-wrap text-sm transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className={isHero ? "text-white/60" : "text-muted-foreground"}>
          Someone just validated
        </span>
        <span className={`font-medium truncate max-w-[300px] ${isHero ? "text-white" : ""}`}>
          &ldquo;{item.idea}&rdquo;
        </span>
        <Badge className={`text-xs ${verdictColor(item.verdict, isHero)}`}>
          Score: {item.score}
        </Badge>
        <span className={`text-xs ${isHero ? "text-white/50" : "text-muted-foreground"}`}>
          {item.timeAgo}
        </span>
      </div>
    </div>
  );
}
