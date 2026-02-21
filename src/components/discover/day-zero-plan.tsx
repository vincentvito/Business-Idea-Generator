"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, DollarSign, Calendar } from "lucide-react";
import { PDFDownloadButton } from "@/components/shared/pdf-download-button";
import type { DayZeroPlan as DayZeroPlanType } from "@/types/discovery";

interface DayZeroPlanProps {
  plan: DayZeroPlanType;
}

export function DayZeroPlan({ plan }: DayZeroPlanProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Day Zero Business Plan
        </h3>
        <PDFDownloadButton
          type="plan"
          data={{ plan }}
          label="Export Plan PDF"
        />
      </div>

      {/* Lean Canvas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lean Canvas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <CanvasBlock title="Problem" items={plan.lean_canvas.problem} />
            <CanvasBlock title="Solution" items={plan.lean_canvas.solution} />
            <CanvasBlock
              title="Value Proposition"
              text={plan.lean_canvas.unique_value_proposition}
            />
            <CanvasBlock
              title="Unfair Advantage"
              text={plan.lean_canvas.unfair_advantage}
            />
            <CanvasBlock
              title="Customer Segments"
              items={plan.lean_canvas.customer_segments}
            />
            <CanvasBlock title="Key Metrics" items={plan.lean_canvas.key_metrics} />
            <CanvasBlock title="Channels" items={plan.lean_canvas.channels} />
            <CanvasBlock
              title="Cost Structure"
              items={plan.lean_canvas.cost_structure}
            />
            <CanvasBlock
              title="Revenue Streams"
              items={plan.lean_canvas.revenue_streams}
            />
          </div>
        </CardContent>
      </Card>

      {/* Revenue Model */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Revenue Model
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="font-medium">Primary Stream</p>
            <p className="text-muted-foreground">{plan.revenue_model.primary_stream}</p>
          </div>
          <div>
            <p className="font-medium">Secondary Streams</p>
            <div className="flex gap-2 flex-wrap mt-1">
              {plan.revenue_model.secondary_streams.map((s, i) => (
                <Badge key={i} variant="outline">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="font-medium">Pricing Strategy</p>
            <p className="text-muted-foreground">
              {plan.revenue_model.pricing_strategy}
            </p>
          </div>
          <div>
            <p className="font-medium">Estimated Monthly Revenue</p>
            <p className="text-lg font-semibold text-green-700">
              {plan.revenue_model.estimated_monthly_revenue_range}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 30-Day Go-To-Market */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            30-Day Go-To-Market Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {plan.go_to_market_30_days.map((week) => (
            <div key={week.week}>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">Week {week.week}</Badge>
                <span className="text-sm font-medium">{week.milestone}</span>
              </div>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-0.5 ml-2">
                {week.tasks.map((task, i) => (
                  <li key={i}>{task}</li>
                ))}
              </ul>
              {week.week < 4 && <Separator className="mt-4" />}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function CanvasBlock({
  title,
  items,
  text,
}: {
  title: string;
  items?: string[];
  text?: string;
}) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
        {title}
      </p>
      {text ? (
        <p className="text-sm">{text}</p>
      ) : (
        <ul className="text-sm space-y-0.5">
          {items?.map((item, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <span className="text-muted-foreground mt-1">-</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
