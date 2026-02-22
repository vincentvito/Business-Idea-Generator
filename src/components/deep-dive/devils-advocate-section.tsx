"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Flame, TrendingDown, Wrench, DollarSign } from "lucide-react";
import type { DevilsAdvocate } from "@/types/deep-dive";

const SEVERITY_COLORS: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-green-100 text-green-700",
};

interface DevilsAdvocateSectionProps {
  data: DevilsAdvocate;
}

export function DevilsAdvocateSection({ data }: DevilsAdvocateSectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-red-500" />
        Devil&apos;s Advocate
      </h2>

      {/* Honest Assessment */}
      <Card className="border-red-200 bg-red-50/50">
        <CardContent className="py-4">
          <p className="text-sm font-medium text-red-900">{data.honest_assessment}</p>
        </CardContent>
      </Card>

      {/* Critical Risks */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Flame className="h-4 w-4 text-red-500" />
            Critical Risks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-2.5 text-left font-medium">Risk</th>
                  <th className="p-2.5 text-center font-medium w-24">Severity</th>
                  <th className="p-2.5 text-center font-medium w-24">Likelihood</th>
                  <th className="p-2.5 text-left font-medium">Mitigation</th>
                </tr>
              </thead>
              <tbody>
                {data.critical_risks.map((risk, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="p-2.5">{risk.risk}</td>
                    <td className="p-2.5 text-center">
                      <Badge className={SEVERITY_COLORS[risk.severity]}>
                        {risk.severity}
                      </Badge>
                    </td>
                    <td className="p-2.5 text-center">
                      <Badge className={SEVERITY_COLORS[risk.likelihood]}>
                        {risk.likelihood}
                      </Badge>
                    </td>
                    <td className="p-2.5 text-muted-foreground">{risk.mitigation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Failure Modes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-orange-500" />
            Failure Modes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.failure_modes.map((fm, i) => (
            <div key={i} className="rounded-lg border p-3 text-sm space-y-1.5">
              <p className="font-medium">{fm.scenario}</p>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Trigger:</span> {fm.trigger}
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium text-green-700">Prevention:</span> {fm.prevention}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Challenge columns */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <TrendingDown className="h-3.5 w-3.5 text-blue-500" />
              Market Challenges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1.5">
              {data.market_challenges.map((c, i) => (
                <li key={i} className="flex gap-1.5">
                  <span className="text-muted-foreground shrink-0">&bull;</span>
                  {c}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <Wrench className="h-3.5 w-3.5 text-orange-500" />
              Execution Challenges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1.5">
              {data.execution_challenges.map((c, i) => (
                <li key={i} className="flex gap-1.5">
                  <span className="text-muted-foreground shrink-0">&bull;</span>
                  {c}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 text-red-500" />
              Financial Challenges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1.5">
              {data.financial_challenges.map((c, i) => (
                <li key={i} className="flex gap-1.5">
                  <span className="text-muted-foreground shrink-0">&bull;</span>
                  {c}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
