"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KeywordTable } from "@/components/validate/keyword-table";
import { TrendingUp, Info } from "lucide-react";
import type { KeywordMetrics } from "@/types/validation";

interface MarketDemandSectionProps {
  metrics: KeywordMetrics[];
  location: string;
  totalVolume: number;
  avgCompetition: number;
  avgCPC: number;
}

function competitionLabel(index: number): { text: string; className: string } {
  if (index < 33) return { text: "Low", className: "bg-green-100 text-green-700" };
  if (index < 66) return { text: "Medium", className: "bg-yellow-100 text-yellow-700" };
  return { text: "High", className: "bg-red-100 text-red-700" };
}

export function MarketDemandSection({
  metrics,
  location,
  totalVolume,
  avgCompetition,
  avgCPC,
}: MarketDemandSectionProps) {
  if (!metrics || metrics.length === 0) return null;

  const comp = competitionLabel(avgCompetition);
  const totalCombinedVolume = metrics.reduce(
    (sum, m) => sum + m.avg_monthly_searches,
    0
  );

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-[#1A4A3A]" />
        Market Demand
      </h2>

      {/* Summary Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Keyword Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Keywords Tracked
              </p>
              <p className="text-lg font-semibold">{metrics.length}</p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Combined Volume
              </p>
              <p className="text-lg font-semibold tabular-nums">
                {totalCombinedVolume.toLocaleString()}/mo
              </p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Avg. Competition
              </p>
              <Badge variant="secondary" className={comp.className}>
                {comp.text} ({avgCompetition}/100)
              </Badge>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Avg. CPC
              </p>
              <p className="text-lg font-semibold tabular-nums">
                ${avgCPC.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Per-Keyword Breakdown */}
          <KeywordTable metrics={metrics} />

          {/* Data source note */}
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <p>
              Monthly search volumes from Google Ads data for the {location} market.
              Volumes include close keyword variants. Numbers may differ from
              clickstream-based tools like Ahrefs or SEMrush.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
