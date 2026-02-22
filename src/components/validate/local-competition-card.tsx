"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star } from "lucide-react";
import type { LocalCompetitionData } from "@/types/validation";

interface LocalCompetitionCardProps {
  data: LocalCompetitionData;
}

function SaturationBadge({
  level,
}: {
  level: LocalCompetitionData["saturation_level"];
}) {
  const styles = {
    low: "bg-green-100 text-green-700",
    moderate: "bg-yellow-100 text-yellow-700",
    high: "bg-orange-100 text-orange-700",
    very_high: "bg-red-100 text-red-700",
  };
  const labels = {
    low: "Low",
    moderate: "Moderate",
    high: "High",
    very_high: "Very High",
  };
  return (
    <Badge variant="secondary" className={styles[level]}>
      {labels[level]}
    </Badge>
  );
}

export function LocalCompetitionCard({ data }: LocalCompetitionCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          <CardTitle className="text-base">Local Competition</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center mb-4">
          <div className="rounded-lg bg-muted/50 p-2">
            <p className="text-lg font-semibold">{data.total_competitors}</p>
            <p className="text-xs text-muted-foreground">Competitors</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-2">
            <div className="flex items-center justify-center gap-1">
              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
              <span className="text-lg font-semibold">{data.avg_rating}</span>
            </div>
            <p className="text-xs text-muted-foreground">Avg Rating</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-2">
            <p className="text-lg font-semibold">
              {data.avg_reviews.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Avg Reviews</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-2">
            <SaturationBadge level={data.saturation_level} />
            <p className="text-xs text-muted-foreground mt-1">Saturation</p>
          </div>
        </div>

        {/* Top competitors list */}
        {data.top_competitors.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Top Local Competitors
            </p>
            {data.top_competitors.slice(0, 5).map((c, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs py-1.5 border-b last:border-0"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-muted-foreground tabular-nums w-4 shrink-0">
                    {i + 1}.
                  </span>
                  <span className="truncate font-medium">{c.name}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-2">
                  {c.category && (
                    <span className="text-muted-foreground hidden sm:inline">
                      {c.category}
                    </span>
                  )}
                  {c.price_level && (
                    <span className="text-muted-foreground">
                      {c.price_level}
                    </span>
                  )}
                  <div className="flex items-center gap-0.5">
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    <span className="tabular-nums">{c.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-muted-foreground tabular-nums">
                    ({c.reviews_count.toLocaleString()})
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rating distribution bar */}
        {data.total_competitors > 0 && (
          <div className="mt-4 pt-3 border-t">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Rating Distribution
            </p>
            <div className="flex gap-2 text-xs">
              {(
                [
                  ["excellent", "4.5+", "bg-green-500"],
                  ["good", "4.0-4.4", "bg-blue-500"],
                  ["average", "3.0-3.9", "bg-yellow-500"],
                  ["poor", "<3.0", "bg-red-500"],
                ] as const
              ).map(([key, label, color]) => {
                const count =
                  data.rating_distribution[key as keyof typeof data.rating_distribution];
                return (
                  <div key={key} className="flex-1 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <div className={`h-2 w-2 rounded-full ${color}`} />
                      <span className="font-semibold">{count}</span>
                    </div>
                    <p className="text-muted-foreground">{label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
