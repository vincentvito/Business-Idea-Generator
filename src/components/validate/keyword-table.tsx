"use client";

import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Sparkline } from "@/components/shared/sparkline";
import type { KeywordMetrics } from "@/types/validation";

interface KeywordTableProps {
  metrics: KeywordMetrics[];
}

function competitionBadge(competition: string) {
  switch (competition) {
    case "LOW":
      return <Badge variant="secondary" className="bg-green-100 text-green-700">Low</Badge>;
    case "MEDIUM":
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Medium</Badge>;
    case "HIGH":
      return <Badge variant="secondary" className="bg-red-100 text-red-700">High</Badge>;
    default:
      return <Badge variant="secondary">N/A</Badge>;
  }
}

export const KeywordTable = memo(function KeywordTable({ metrics }: KeywordTableProps) {
  const hasMonthlyData = metrics.some((m) => m.monthly_searches && m.monthly_searches.length > 0);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="pb-2 pr-4 font-medium">Keyword</th>
            <th className="pb-2 pr-4 font-medium text-right">Volume/mo</th>
            <th className="pb-2 pr-4 font-medium text-right">CPC</th>
            <th className="pb-2 pr-4 font-medium">Competition</th>
            {hasMonthlyData && (
              <th className="pb-2 font-medium text-right">Trend</th>
            )}
          </tr>
        </thead>
        <tbody>
          {metrics.map((m) => (
            <tr key={m.keyword} className="border-b last:border-0">
              <td className="py-2 pr-4 font-medium">{m.keyword}</td>
              <td className="py-2 pr-4 text-right tabular-nums">
                {m.avg_monthly_searches.toLocaleString()}
              </td>
              <td className="py-2 pr-4 text-right tabular-nums">
                ${m.high_top_of_page_bid.toFixed(2)}
              </td>
              <td className="py-2 pr-4">{competitionBadge(m.competition)}</td>
              {hasMonthlyData && (
                <td className="py-2 text-right">
                  {m.monthly_searches && m.monthly_searches.length > 0 ? (
                    <Sparkline
                      data={m.monthly_searches.map((ms) => ms.search_volume)}
                      width={80}
                      height={24}
                    />
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});
