"use client";

import Link from "next/link";
import { getPivotSuggestions } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, RefreshCw } from "lucide-react";

interface PivotSuggestionsProps {
  ideaTitle: string;
  currentScore: number;
}

export function PivotSuggestions({ ideaTitle, currentScore }: PivotSuggestionsProps) {
  const pivots = getPivotSuggestions(ideaTitle, currentScore);

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <RefreshCw className="h-4 w-4 text-muted-foreground" />
        <h4 className="font-medium text-sm">Consider These Pivots</h4>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Your idea scored below average. Here are 3 pivots that could perform better:
      </p>
      <div className="space-y-3">
        {pivots.map((pivot) => (
          <div key={pivot.id} className="rounded-md border p-3">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-medium text-sm">{pivot.pivotTitle}</span>
              <Badge className="text-xs bg-green-100 text-green-800">
                Score: ~{pivot.estimatedScore}
              </Badge>
              <Badge variant="outline" className="text-xs">
                +{pivot.estimatedScore - currentScore} pts
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-2">{pivot.pivotReason}</p>
            <Button asChild size="sm" variant="ghost" className="h-6 text-xs px-2">
              <Link href="/validate">
                Validate this pivot <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
