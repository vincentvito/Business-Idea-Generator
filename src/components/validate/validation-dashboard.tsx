"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScoreGauge } from "./score-gauge";
import { KeywordTable } from "./keyword-table";
import { CompetitorCard } from "./competitor-card";
import { LocalCompetitionCard } from "./local-competition-card";
import { MoatAnalysis } from "./moat-analysis";
import { TrendChart } from "@/components/shared/trend-chart";
import { RevenueCalculator } from "@/components/shared/revenue-calculator";
import { PivotSuggestions } from "@/components/shared/pivot-suggestions";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ShoppingCart,
  Star,
  AlertTriangle,
} from "lucide-react";
import { PDFDownloadButton } from "@/components/shared/pdf-download-button";
import type {
  KeywordExtractionResult,
  KeywordMetrics,
  CompetitorAnalysis,
  MoatAnalysis as MoatAnalysisType,
  TrendData,
  AmazonProductData,
  LocalCompetitionData,
  ScoreData,
} from "@/types/validation";

interface ValidationDashboardProps {
  keywords: KeywordExtractionResult | null;
  metrics: KeywordMetrics[] | null;
  trends: TrendData[] | null;
  competitors: CompetitorAnalysis[] | null;
  moat: MoatAnalysisType | null;
  amazon: AmazonProductData[] | null;
  localCompetition: LocalCompetitionData | null;
  scores: ScoreData | null;
  warnings?: Map<string, string>;
}

function verdictBadge(verdict: string) {
  switch (verdict) {
    case "strong":
      return <Badge className="bg-green-100 text-green-700 text-sm">Strong Opportunity</Badge>;
    case "promising":
      return <Badge className="bg-blue-100 text-blue-700 text-sm">Promising</Badge>;
    case "risky":
      return <Badge className="bg-orange-100 text-orange-700 text-sm">Risky</Badge>;
    case "weak":
      return <Badge className="bg-red-100 text-red-700 text-sm">Weak</Badge>;
    default:
      return null;
  }
}

function trendIcon(direction: TrendData["trend_direction"]) {
  switch (direction) {
    case "rising":
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    case "declining":
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    default:
      return <Minus className="h-4 w-4 text-gray-500" />;
  }
}

function trendBadge(direction: TrendData["trend_direction"], growth: number) {
  const colors = {
    rising: "bg-green-100 text-green-700",
    stable: "bg-gray-100 text-gray-700",
    declining: "bg-red-100 text-red-700",
  };
  return (
    <Badge variant="secondary" className={colors[direction]}>
      {growth > 0 ? "+" : ""}{growth}%
    </Badge>
  );
}

function StageWarning({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 rounded px-2 py-1">
      <AlertTriangle className="h-3 w-3 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="text-sm text-muted-foreground py-2">{message}</p>
  );
}

export function ValidationDashboard({
  keywords,
  metrics,
  trends,
  competitors,
  moat,
  amazon,
  localCompetition,
  scores,
  warnings,
}: ValidationDashboardProps) {
  const totalVolume = metrics?.reduce((sum, m) => sum + m.avg_monthly_searches, 0) ?? 0;

  return (
    <div className="space-y-6">
      {/* PDF Export */}
      {scores && (
        <div className="flex justify-end">
          <PDFDownloadButton
            type="validation"
            data={{
              idea: keywords?.niche,
              keywords,
              scores,
              metrics,
              trends,
              competitors,
              moat,
              amazon,
              localCompetition,
            }}
            label="Export Report PDF"
          />
        </div>
      )}

      {/* Scores Section */}
      {scores && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Validation Score</CardTitle>
              {verdictBadge(scores.verdict)}
            </div>
            <p className="text-sm text-muted-foreground">{scores.one_liner}</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-4 justify-items-center">
              <ScoreGauge score={scores.overall_score} label="Overall" size="lg" />
              <ScoreGauge score={scores.market_demand_score} label="Demand" />
              <ScoreGauge score={scores.competition_score} label="Competition" />
              <ScoreGauge score={scores.monetization_score} label="Monetization" />
              <ScoreGauge score={scores.timing_score} label="Timing" />
              {scores.ecommerce_score != null && (
                <ScoreGauge score={scores.ecommerce_score} label="eCommerce" />
              )}
              {scores.local_competition_score != null && (
                <ScoreGauge score={scores.local_competition_score} label="Local" />
              )}
            </div>

            <Separator className="my-4" />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="font-medium text-sm mb-2">Key Risks</p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {scores.key_risks.map((risk, i) => (
                    <li key={i}>{risk}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-medium text-sm mb-2">Recommended Next Steps</p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {scores.next_steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Keywords Section */}
      {keywords && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Identified Niche</CardTitle>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline">{keywords.niche}</Badge>
              <Badge variant="outline">{keywords.location}</Badge>
              <Badge variant="outline">{keywords.category}</Badge>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Keyword Metrics Table */}
      {metrics !== null && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Keyword Data</CardTitle>
              {warnings?.get("metrics") && (
                <StageWarning message={warnings.get("metrics")!} />
              )}
            </div>
          </CardHeader>
          <CardContent>
            {metrics.length > 0 ? (
              <KeywordTable metrics={metrics} />
            ) : (
              <EmptyState message="No search volume data returned. The API may not support this keyword or location. Check your DataForSEO dashboard for details." />
            )}
          </CardContent>
        </Card>
      )}

      {/* Search Trends */}
      {trends && trends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Search Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trends.map((trend) => (
                <div key={trend.keyword}>
                  <div className="flex items-center gap-2 mb-2">
                    {trendIcon(trend.trend_direction)}
                    <span className="text-sm font-medium">{trend.keyword}</span>
                    {trendBadge(trend.trend_direction, trend.growth_percentage)}
                  </div>
                  <TrendChart
                    data={trend.timeline.map((t) => ({
                      month: t.date,
                      volume: t.value,
                    }))}
                    height={120}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Revenue Calculator */}
      {totalVolume > 0 && <RevenueCalculator defaultVolume={totalVolume} />}

      {/* Amazon Marketplace Data */}
      {amazon !== null && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              <CardTitle className="text-base">Amazon Marketplace</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {amazon.length > 0 ? (
              <div className="space-y-4">
                {amazon.map((amz) => (
                  <div key={amz.keyword} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">&ldquo;{amz.keyword}&rdquo;</span>
                      <span className="text-xs text-muted-foreground">
                        {amz.total_products} products found
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                      <div className="rounded-lg bg-muted/50 p-2">
                        <p className="text-lg font-semibold">${amz.avg_price.toFixed(0)}</p>
                        <p className="text-xs text-muted-foreground">Avg Price</p>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-2">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-lg font-semibold">{amz.avg_rating.toFixed(1)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Avg Rating</p>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-2">
                        <p className="text-lg font-semibold">{amz.total_products}</p>
                        <p className="text-xs text-muted-foreground">Products</p>
                      </div>
                    </div>
                    {amz.top_products.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Top Products</p>
                        {amz.top_products.slice(0, 3).map((product, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between text-xs py-1 border-b last:border-0"
                          >
                            <span className="truncate mr-2 flex-1">{product.title}</span>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="tabular-nums">${product.price.toFixed(2)}</span>
                              <div className="flex items-center gap-0.5">
                                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                <span className="tabular-nums">{product.rating.toFixed(1)}</span>
                              </div>
                              <span className="text-muted-foreground">
                                ({product.reviews_count.toLocaleString()})
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No Amazon marketplace data returned. The Amazon Products API may not be included in your DataForSEO plan." />
            )}
          </CardContent>
        </Card>
      )}

      {/* Local Competition */}
      {localCompetition && (
        <LocalCompetitionCard data={localCompetition} />
      )}

      {/* Moat Analysis */}
      {moat && <MoatAnalysis moat={moat} />}

      {/* Competitor Cards */}
      {competitors && competitors.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Competitor Analysis</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {competitors.map((c, i) => (
              <CompetitorCard key={i} competitor={c} />
            ))}
          </div>
        </div>
      )}

      {/* Pivot Suggestions (when score is low) */}
      {scores && (scores.verdict === "risky" || scores.verdict === "weak") && keywords && (
        <PivotSuggestions
          ideaTitle={keywords.niche}
          currentScore={scores.overall_score}
        />
      )}
    </div>
  );
}
