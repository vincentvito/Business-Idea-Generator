"use client";

import { useState, useMemo } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { getTrendingNiches } from "@/lib/mock-data";
import { CATEGORIES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Sparkline } from "@/components/shared/sparkline";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

function competitionBadge(level: string) {
  const styles: Record<string, string> = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  };
  return styles[level] ?? "";
}

export default function TrendingPage() {
  const [category, setCategory] = useState("all");
  const [opportunity, setOpportunity] = useState("all");

  const allNiches = useMemo(() => getTrendingNiches(), []);

  const filtered = useMemo(() => {
    let niches = allNiches;
    if (category !== "all") niches = niches.filter((n) => n.category === category);
    if (opportunity !== "all") niches = niches.filter((n) => n.opportunity === opportunity);
    return niches;
  }, [allNiches, category, opportunity]);

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Trending Niches</h1>
        <p className="text-muted-foreground mt-1">
          Discover which niches are seeing rising search demand.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={opportunity} onValueChange={setOpportunity}>
          <SelectTrigger><SelectValue placeholder="Opportunity" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="rising">Rising</SelectItem>
            <SelectItem value="stable">Stable</SelectItem>
            <SelectItem value="declining">Declining</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((niche) => (
          <div key={niche.id} className="rounded-lg border bg-card p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-medium text-sm">{niche.name}</h3>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                {niche.growthPercent > 0 ? (
                  <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                ) : niche.growthPercent < -5 ? (
                  <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                ) : (
                  <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                <span
                  className={`text-sm font-medium ${
                    niche.growthPercent > 0
                      ? "text-green-600"
                      : niche.growthPercent < -5
                      ? "text-red-500"
                      : "text-muted-foreground"
                  }`}
                >
                  {niche.growthPercent > 0 ? "+" : ""}
                  {niche.growthPercent}%
                </span>
              </div>
            </div>

            <Sparkline
              data={niche.monthlyData}
              color={niche.growthPercent > 0 ? "#22c55e" : niche.growthPercent < -5 ? "#ef4444" : "#94a3b8"}
              width={200}
              height={40}
            />

            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <Badge variant="outline" className="text-xs">{niche.category}</Badge>
              <Badge className={`text-xs ${competitionBadge(niche.competitionLevel)}`}>
                {niche.competitionLevel} comp
              </Badge>
              <span className="text-xs text-muted-foreground">
                {niche.searchVolume.toLocaleString()}/mo
              </span>
            </div>

            <div className="flex flex-wrap gap-1 mt-2">
              {niche.relatedKeywords.map((kw) => (
                <span key={kw} className="text-xs text-muted-foreground bg-muted rounded px-1.5 py-0.5">
                  {kw}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No trending niches found with these filters.
        </div>
      )}
    </PageContainer>
  );
}
