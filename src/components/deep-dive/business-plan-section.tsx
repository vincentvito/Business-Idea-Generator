"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Target,
  Crosshair,
  Shield,
  DollarSign,
} from "lucide-react";
import type { BusinessPlanBasics } from "@/types/deep-dive";

interface BusinessPlanSectionProps {
  data: BusinessPlanBasics;
}

export function BusinessPlanSection({ data }: BusinessPlanSectionProps) {
  const { executive_summary, mission_vision, target_market, competitive_advantage, financial_projections } = data;

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <FileText className="h-5 w-5 text-[#1A4A3A]" />
        Business Plan
      </h2>

      {/* Executive Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Executive Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>{executive_summary.overview}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">Value Proposition</p>
              <p>{executive_summary.value_proposition}</p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">Business Model</p>
              <p>{executive_summary.business_model}</p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">Target Market</p>
              <p>{executive_summary.target_market_summary}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mission & Vision */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-500" />
            Mission & Vision
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="font-medium text-xs text-muted-foreground mb-1">Mission</p>
            <p>{mission_vision.mission}</p>
          </div>
          <div>
            <p className="font-medium text-xs text-muted-foreground mb-1">Vision</p>
            <p>{mission_vision.vision}</p>
          </div>
          <div>
            <p className="font-medium text-xs text-muted-foreground mb-1">Core Values</p>
            <div className="flex flex-wrap gap-1.5">
              {mission_vision.core_values.map((v) => (
                <Badge key={v} variant="secondary">{v}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Target Market */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Crosshair className="h-4 w-4 text-green-500" />
            Target Market Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">Primary Segment</p>
              <p>{target_market.primary_segment}</p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">Segment Size</p>
              <p>{target_market.segment_size}</p>
            </div>
          </div>
          <div>
            <p className="font-medium text-xs text-muted-foreground mb-1">Demographics</p>
            <ul className="list-disc pl-4 space-y-0.5">
              {target_market.demographics.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
          </div>
          <div>
            <p className="font-medium text-xs text-muted-foreground mb-1">Pain Points</p>
            <ul className="list-disc pl-4 space-y-0.5">
              {target_market.pain_points.map((p, i) => <li key={i}>{p}</li>)}
            </ul>
          </div>
          <div>
            <p className="font-medium text-xs text-muted-foreground mb-1">Buying Behavior</p>
            <p>{target_market.buying_behavior}</p>
          </div>
        </CardContent>
      </Card>

      {/* Competitive Advantage */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-orange-500" />
            Competitive Advantage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {competitive_advantage.direct_competitors.length > 0 && (
            <div>
              <p className="font-medium text-xs text-muted-foreground mb-2">Direct Competitors</p>
              <div className="space-y-2">
                {competitive_advantage.direct_competitors.map((c, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-lg bg-muted p-2.5">
                    <span className="font-medium shrink-0">{c.name}</span>
                    <span className="text-muted-foreground">— {c.weakness}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div>
            <p className="font-medium text-xs text-muted-foreground mb-1">Your Differentiators</p>
            <ul className="list-disc pl-4 space-y-0.5">
              {competitive_advantage.your_differentiators.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
          </div>
          <div>
            <p className="font-medium text-xs text-muted-foreground mb-1">Moat Strategy</p>
            <p>{competitive_advantage.moat_strategy}</p>
          </div>
        </CardContent>
      </Card>

      {/* Financial Projections */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-500" />
            Financial Projections
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">Break-Even</p>
              <p className="font-semibold">{financial_projections.break_even_timeline}</p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">Funding Needed</p>
              <p className="font-semibold">{financial_projections.funding_needed}</p>
            </div>
          </div>

          {/* Startup Costs */}
          <div>
            <p className="font-medium text-xs text-muted-foreground mb-2">Startup Costs</p>
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-2 text-left font-medium">Item</th>
                    <th className="p-2 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {financial_projections.startup_costs.map((c, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="p-2">{c.item}</td>
                      <td className="p-2 text-right tabular-nums">{c.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Revenue Projections */}
          <div>
            <p className="font-medium text-xs text-muted-foreground mb-2">Revenue Projections</p>
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-2 text-left font-medium">Month</th>
                    <th className="p-2 text-right font-medium">Revenue</th>
                    <th className="p-2 text-left font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {financial_projections.revenue_projections.map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="p-2">Month {r.month}</td>
                      <td className="p-2 text-right tabular-nums">{r.revenue}</td>
                      <td className="p-2 text-muted-foreground">{r.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
