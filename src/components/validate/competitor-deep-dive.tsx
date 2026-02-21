"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { CompetitorAnalysis } from "@/types/validation";
import { hash, seededRange } from "@/lib/mock-data";
import { Globe, Users, FileText, Target } from "lucide-react";

interface CompetitorDeepDiveProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  competitor: CompetitorAnalysis;
}

const MOCK_KEYWORDS = [
  "best solution", "alternatives", "pricing", "reviews",
  "vs competitors", "tutorial", "features", "free trial",
  "enterprise", "startup",
];

export function CompetitorDeepDive({ open, onOpenChange, competitor }: CompetitorDeepDiveProps) {
  const seed = hash(competitor.name);
  const traffic = seededRange(seed, 5000, 500000);
  const pages = seededRange(seed + 1, 20, 2000);
  const domainAge = seededRange(seed + 2, 1, 12);

  const topKeywords = MOCK_KEYWORDS.slice(0, 5).map((kw, i) => ({
    keyword: `${competitor.name.toLowerCase().split(" ")[0]} ${kw}`,
    volume: seededRange(seed + i + 10, 100, 15000),
    position: seededRange(seed + i + 20, 1, 20),
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{competitor.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <a href={competitor.url} target="_blank" rel="noreferrer" className="text-sm text-primary underline truncate">
              {competitor.url}
            </a>
            <Badge variant={
              competitor.estimated_authority === "high" ? "destructive" :
              competitor.estimated_authority === "medium" ? "secondary" : "outline"
            } className="text-xs ml-auto">
              {competitor.estimated_authority} authority
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-md border p-2">
              <p className="text-sm font-bold">{traffic.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Est. Monthly Traffic</p>
            </div>
            <div className="rounded-md border p-2">
              <p className="text-sm font-bold">{pages.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Indexed Pages</p>
            </div>
            <div className="rounded-md border p-2">
              <p className="text-sm font-bold">{domainAge}y</p>
              <p className="text-xs text-muted-foreground">Domain Age</p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-green-600" />
              <p className="text-sm font-medium">Strengths</p>
            </div>
            <ul className="space-y-1">
              {competitor.strengths.map((s, i) => (
                <li key={i} className="text-sm text-muted-foreground flex gap-1.5">
                  <span className="text-green-600 shrink-0">+</span> {s}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-red-500" />
              <p className="text-sm font-medium">Weaknesses</p>
            </div>
            <ul className="space-y-1">
              {competitor.weaknesses.map((w, i) => (
                <li key={i} className="text-sm text-muted-foreground flex gap-1.5">
                  <span className="text-red-500 shrink-0">-</span> {w}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">Top Keywords They Rank For</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="text-left py-1">Keyword</th>
                    <th className="text-right py-1">Volume</th>
                    <th className="text-right py-1">Position</th>
                  </tr>
                </thead>
                <tbody>
                  {topKeywords.map((kw) => (
                    <tr key={kw.keyword} className="border-b last:border-0">
                      <td className="py-1.5">{kw.keyword}</td>
                      <td className="py-1.5 text-right text-muted-foreground">{kw.volume.toLocaleString()}</td>
                      <td className="py-1.5 text-right">
                        <Badge variant="outline" className="text-xs">#{kw.position}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-500" />
              <p className="text-sm font-medium">How to Beat Them</p>
            </div>
            <p className="text-sm text-muted-foreground">
              {competitor.differentiation_opportunity}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
