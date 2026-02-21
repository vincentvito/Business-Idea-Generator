"use client";

import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";
import type { MoatAnalysis as MoatAnalysisType } from "@/types/validation";

interface MoatAnalysisProps {
  moat: MoatAnalysisType;
}

function competitionLevelBadge(level: string) {
  switch (level) {
    case "low":
      return <Badge className="bg-green-100 text-green-700">Low Competition</Badge>;
    case "medium":
      return <Badge className="bg-yellow-100 text-yellow-700">Medium Competition</Badge>;
    case "high":
      return <Badge className="bg-orange-100 text-orange-700">High Competition</Badge>;
    case "very_high":
      return <Badge className="bg-red-100 text-red-700">Very High Competition</Badge>;
    default:
      return <Badge variant="secondary">{level}</Badge>;
  }
}

export const MoatAnalysis = memo(function MoatAnalysis({ moat }: MoatAnalysisProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">Moat Analysis</CardTitle>
          {competitionLevelBadge(moat.overall_competition_level)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div>
          <p className="font-medium mb-1">Biggest Market Gap</p>
          <p className="text-muted-foreground">{moat.biggest_gap}</p>
        </div>
        <div>
          <p className="font-medium mb-1">Recommended Positioning</p>
          <p className="text-muted-foreground">{moat.recommended_positioning}</p>
        </div>
        <div>
          <p className="font-medium mb-1">Unfair Advantages to Build</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
            {moat.unfair_advantages_to_build.map((adv, i) => (
              <li key={i}>{adv}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
});
