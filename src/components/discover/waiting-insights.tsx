"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Trophy, TrendingUp, ThumbsUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Sparkline } from "@/components/shared/sparkline";
import { BookmarkButton } from "@/components/shared/bookmark-button";
import { getLeaderboardIdeas, getTrendingNiches } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { LeaderboardIdea } from "@/types/leaderboard";
import type { TrendingNiche } from "@/types/trending";

interface WaitingInsightsProps {
  category: string;
  location: string;
}

const TAB_LABELS = ["Top Ideas", "Trending", "Community Picks"] as const;
const CYCLE_MS = 8000;

function verdictColor(verdict: string) {
  const colors: Record<string, string> = {
    strong: "bg-green-100 text-green-800",
    promising: "bg-yellow-100 text-yellow-800",
    risky: "bg-orange-100 text-orange-800",
    weak: "bg-red-100 text-red-800",
  };
  return colors[verdict] ?? "";
}

function competitionColor(level: string) {
  const colors: Record<string, string> = {
    low: "bg-green-100 text-green-700",
    medium: "bg-yellow-100 text-yellow-700",
    high: "bg-red-100 text-red-700",
  };
  return colors[level] ?? "";
}

export function WaitingInsights({ category, location }: WaitingInsightsProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [visible, setVisible] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const topIdeas = useMemo(() => {
    let ideas = getLeaderboardIdeas({ category });
    if (ideas.length >= 3) return ideas.slice(0, 3);
    ideas = getLeaderboardIdeas({ location });
    if (ideas.length >= 3) return ideas.slice(0, 3);
    return getLeaderboardIdeas().slice(0, 3);
  }, [category, location]);

  const trendingNiches = useMemo(() => {
    const all = getTrendingNiches();
    const categoryNiches = all.filter(
      (n) => n.category === category && n.opportunity === "rising"
    );
    if (categoryNiches.length >= 3) return categoryNiches.slice(0, 3);
    return all.filter((n) => n.opportunity === "rising").slice(0, 3);
  }, [category]);

  const communityPicks = useMemo(() => {
    return [...getLeaderboardIdeas()]
      .sort((a, b) => b.upvotes - a.upvotes)
      .slice(0, 3);
  }, []);

  const startInterval = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setActiveTab((prev) => (prev + 1) % TAB_LABELS.length);
        setVisible(true);
      }, 300);
    }, CYCLE_MS);
  }, []);

  useEffect(() => {
    startInterval();
    return () => clearInterval(intervalRef.current);
  }, [startInterval]);

  const handleTabClick = (index: number) => {
    if (index === activeTab) return;
    setVisible(false);
    setTimeout(() => {
      setActiveTab(index);
      setVisible(true);
    }, 300);
    startInterval();
  };

  return (
    <div className="rounded-lg border bg-card p-4 animate-in fade-in-0 duration-500">
      <p className="text-sm text-muted-foreground mb-4">
        While we generate your ideas, here&apos;s what&apos;s trending...
      </p>

      <div
        className={cn(
          "transition-opacity duration-300 min-h-[260px]",
          visible ? "opacity-100" : "opacity-0"
        )}
      >
        {activeTab === 0 && (
          <TopIdeasPreview ideas={topIdeas} category={category} />
        )}
        {activeTab === 1 && (
          <TrendingNichesPreview niches={trendingNiches} category={category} />
        )}
        {activeTab === 2 && <CommunityPicksPreview ideas={communityPicks} />}
      </div>

      <div className="flex items-center justify-center gap-2 mt-4">
        {TAB_LABELS.map((label, i) => (
          <button
            key={label}
            onClick={() => handleTabClick(i)}
            className={cn(
              "text-xs px-2.5 py-1 rounded-full transition-colors",
              activeTab === i
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function TopIdeasPreview({
  ideas,
  category,
}: {
  ideas: LeaderboardIdea[];
  category: string;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <Trophy className="h-4 w-4 text-yellow-500" />
        Top Ideas in {category}
      </h3>
      {ideas.map((idea, i) => (
        <div
          key={idea.id}
          className="flex items-center gap-3 rounded-lg border bg-background p-3"
        >
          <span className="text-sm font-mono text-muted-foreground w-5 shrink-0 text-center">
            {i + 1}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{idea.title}</p>
            <p className="text-xs text-muted-foreground truncate">
              {idea.oneLiner}
            </p>
          </div>
          <Badge className={cn("text-xs shrink-0", verdictColor(idea.verdict))}>
            {idea.overallScore}
          </Badge>
          <BookmarkButton
            ideaId={idea.id}
            ideaTitle={idea.title}
            score={idea.overallScore}
            category={idea.category}
          />
        </div>
      ))}
    </div>
  );
}

function TrendingNichesPreview({
  niches,
  category,
}: {
  niches: TrendingNiche[];
  category: string;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-green-600" />
        Trending in {category}
      </h3>
      {niches.map((niche) => (
        <div key={niche.id} className="rounded-lg border bg-background p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="font-medium text-sm">{niche.name}</p>
            <span
              className={cn(
                "text-sm font-medium",
                niche.growthPercent > 0
                  ? "text-green-600"
                  : "text-muted-foreground"
              )}
            >
              {niche.growthPercent > 0 ? "+" : ""}
              {niche.growthPercent}%
            </span>
          </div>
          <Sparkline
            data={niche.monthlyData}
            color={niche.growthPercent > 0 ? "#22c55e" : "#94a3b8"}
            width={200}
            height={32}
          />
          <div className="flex items-center gap-2 mt-2">
            <Badge
              className={cn(
                "text-xs",
                competitionColor(niche.competitionLevel)
              )}
            >
              {niche.competitionLevel} comp
            </Badge>
            <span className="text-xs text-muted-foreground">
              {niche.searchVolume.toLocaleString()}/mo
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function CommunityPicksPreview({ ideas }: { ideas: LeaderboardIdea[] }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <ThumbsUp className="h-4 w-4 text-blue-500" />
        Community Picks This Week
      </h3>
      {ideas.map((idea) => (
        <div
          key={idea.id}
          className="flex items-center gap-3 rounded-lg border bg-background p-3"
        >
          <div className="flex items-center gap-1 text-sm text-muted-foreground shrink-0">
            <ThumbsUp className="h-3.5 w-3.5" />
            <span className="tabular-nums">{idea.upvotes}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{idea.title}</p>
            <p className="text-xs text-muted-foreground truncate">
              {idea.oneLiner}
            </p>
          </div>
          <Badge variant="outline" className="text-xs shrink-0">
            {idea.category}
          </Badge>
          <BookmarkButton
            ideaId={idea.id}
            ideaTitle={idea.title}
            score={idea.overallScore}
            category={idea.category}
          />
        </div>
      ))}
    </div>
  );
}
