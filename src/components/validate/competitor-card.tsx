"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Eye } from "lucide-react";
import { CompetitorDeepDive } from "./competitor-deep-dive";
import type { CompetitorAnalysis } from "@/types/validation";

interface CompetitorCardProps {
  competitor: CompetitorAnalysis;
}

export function CompetitorCard({ competitor }: CompetitorCardProps) {
  const [deepDiveOpen, setDeepDiveOpen] = useState(false);

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-sm font-medium">{competitor.name}</CardTitle>
            <Badge
              variant="secondary"
              className={
                competitor.estimated_authority === "high"
                  ? "bg-red-100 text-red-700"
                  : competitor.estimated_authority === "medium"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
              }
            >
              {competitor.estimated_authority} authority
            </Badge>
          </div>
          <a
            href={competitor.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:underline inline-flex items-center gap-1"
          >
            {competitor.url.replace(/^https?:\/\//, "").slice(0, 40)}
            <ExternalLink className="h-3 w-3" />
          </a>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="font-medium text-green-700 mb-1">Strengths</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
              {competitor.strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-medium text-red-700 mb-1">Weaknesses</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
              {competitor.weaknesses.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-medium text-blue-700 mb-1">Differentiation Opportunity</p>
            <p className="text-muted-foreground">{competitor.differentiation_opportunity}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 gap-1.5"
            onClick={() => setDeepDiveOpen(true)}
          >
            <Eye className="h-3.5 w-3.5" /> View Details
          </Button>
        </CardContent>
      </Card>
      <CompetitorDeepDive
        open={deepDiveOpen}
        onOpenChange={setDeepDiveOpen}
        competitor={competitor}
      />
    </>
  );
}
