"use client";

import { useState, useMemo } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { getLeaderboardIdeas } from "@/lib/mock-data";
import { CATEGORIES, POPULAR_LOCATIONS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreGauge } from "@/components/validate/score-gauge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, ChevronUp, Trophy, TrendingUp, Star } from "lucide-react";
import type { LeaderboardFilters } from "@/lib/mock-data";

function verdictBadge(verdict: string) {
  const colors: Record<string, string> = {
    strong: "bg-green-100 text-green-800",
    promising: "bg-yellow-100 text-yellow-800",
    risky: "bg-orange-100 text-orange-800",
    weak: "bg-red-100 text-red-800",
  };
  return colors[verdict] ?? "";
}

export default function TopIdeasPage() {
  const [filters, setFilters] = useState<LeaderboardFilters>({
    category: "all",
    location: "all",
    timeRange: "all",
  });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const ideas = useMemo(() => getLeaderboardIdeas(filters), [filters]);

  return (
    <PageContainer>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <h1 className="text-2xl font-bold">Top Food Business Ideas</h1>
        </div>
        <p className="text-muted-foreground">
          The highest-scoring validated ideas, ranked by data.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <Select
          value={filters.category}
          onValueChange={(v) => setFilters((f) => ({ ...f, category: v }))}
        >
          <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.location}
          onValueChange={(v) => setFilters((f) => ({ ...f, location: v }))}
        >
          <SelectTrigger><SelectValue placeholder="Location" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {POPULAR_LOCATIONS.map((l) => (
              <SelectItem key={l} value={l}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.timeRange}
          onValueChange={(v) => setFilters((f) => ({ ...f, timeRange: v as LeaderboardFilters["timeRange"] }))}
        >
          <SelectTrigger><SelectValue placeholder="Time Range" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground mb-3">
        {ideas.length} ideas found
      </p>

      <div className="space-y-2">
        {ideas.map((idea, index) => {
          const isExpanded = expandedId === idea.id;
          return (
            <div key={idea.id} className="rounded-lg border bg-card">
              <button
                onClick={() => setExpandedId(isExpanded ? null : idea.id)}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-accent/50 transition-colors rounded-lg"
              >
                <span className="text-sm font-mono text-muted-foreground w-6 shrink-0 text-right">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm truncate">{idea.title}</span>
                    <Badge className={`text-xs ${verdictBadge(idea.verdict)}`}>
                      {idea.overallScore}
                    </Badge>
                    {idea.overallScore >= 80 && (
                      <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{idea.oneLiner}</p>
                </div>
                <div className="hidden sm:flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Volume</p>
                    <p className="text-sm font-medium">{idea.totalVolume.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span className="text-sm">{idea.upvotes}</span>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
              </button>

              {isExpanded && (
                <div className="px-3 pb-4 pt-1 border-t">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline">{idea.category}</Badge>
                    <Badge variant="secondary">{idea.location}</Badge>
                    <Badge variant="outline">${idea.avgCPC.toFixed(2)} CPC</Badge>
                  </div>

                  <div className="flex flex-wrap gap-4 mb-4">
                    <ScoreGauge label="Overall" score={idea.overallScore} size="sm" />
                    <ScoreGauge label="Demand" score={idea.demandScore} size="sm" />
                    <ScoreGauge label="Competition" score={idea.competitionScore} size="sm" />
                    <ScoreGauge label="Monetization" score={idea.monetizationScore} size="sm" />
                    <ScoreGauge label="Timing" score={idea.timingScore} size="sm" />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium mb-1">Key Risks</p>
                      <ul className="space-y-1">
                        {idea.keyRisks.map((risk, i) => (
                          <li key={i} className="text-muted-foreground flex gap-1.5">
                            <span className="text-destructive shrink-0">-</span>
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium mb-1">Next Steps</p>
                      <ul className="space-y-1">
                        {idea.nextSteps.map((step, i) => (
                          <li key={i} className="text-muted-foreground flex gap-1.5">
                            <span className="text-green-600 shrink-0">-</span>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {idea.keywords.map((kw) => (
                      <Badge key={kw} variant="outline" className="text-xs">{kw}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {ideas.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No ideas found with these filters. Try broadening your search.
          </div>
        )}
      </div>
    </PageContainer>
  );
}
