"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Megaphone,
  BarChart3,
  Calendar,
  Users,
  MapPin,
  ChevronDown,
  ChevronUp,
  Target,
  Rocket,
  Repeat,
  CheckCircle2,
  Circle,
  DollarSign,
} from "lucide-react";
import type { MarketingPlan, ContentCalendarWeek } from "@/types/deep-dive";

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-gray-100 text-gray-700",
};

interface MarketingPlanSectionProps {
  data: MarketingPlan;
  deepDiveId?: string;
}

export function MarketingPlanSection({
  data,
  deepDiveId,
}: MarketingPlanSectionProps) {
  const storageKey = `deep-dive-seo-${deepDiveId ?? "default"}`;

  const [checkedSeo, setCheckedSeo] = useState<Set<number>>(new Set());
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set());

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setCheckedSeo(new Set(JSON.parse(saved)));
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  const toggleSeo = (index: number) => {
    setCheckedSeo((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      localStorage.setItem(storageKey, JSON.stringify([...next]));
      return next;
    });
  };

  const toggleWeek = (week: number) => {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(week)) {
        next.delete(week);
      } else {
        next.add(week);
      }
      return next;
    });
  };

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Megaphone className="h-5 w-5 text-pink-500" />
        90-Day Marketing Plan
      </h2>

      {/* Overview */}
      <Card className="border-pink-200 bg-pink-50/30">
        <CardContent className="py-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-pink-600" />
            <span className="text-sm font-medium">Total Budget:</span>
            <span className="text-sm font-bold">{data.total_budget}</span>
          </div>
          <p className="text-sm">{data.overview}</p>
        </CardContent>
      </Card>

      {/* Channels */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Marketing Channels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.channels.map((ch, i) => (
              <div key={i} className="rounded-lg border p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{ch.channel}</span>
                  <Badge
                    className={`text-xs ${PRIORITY_COLORS[ch.priority] ?? PRIORITY_COLORS.low}`}
                  >
                    {ch.priority}
                  </Badge>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {ch.budget_allocation_percent}% of budget
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-1">
                  {ch.strategy}
                </p>
                <p className="text-xs text-green-600">
                  Expected ROI: {ch.expected_roi}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tactics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              Pre-Launch
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {data.pre_launch_tactics.map((t, i) => (
                <li key={i} className="text-sm flex gap-1.5">
                  <span className="text-muted-foreground shrink-0">&bull;</span>
                  {t}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Rocket className="h-4 w-4 text-orange-500" />
              Launch Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {data.launch_week_tactics.map((t, i) => (
                <li key={i} className="text-sm flex gap-1.5">
                  <span className="text-muted-foreground shrink-0">&bull;</span>
                  {t}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Repeat className="h-4 w-4 text-green-500" />
              Ongoing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {data.ongoing_tactics.map((t, i) => (
                <li key={i} className="text-sm flex gap-1.5">
                  <span className="text-muted-foreground shrink-0">&bull;</span>
                  {t}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Content Calendar */}
      {data.content_calendar.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Content Calendar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.content_calendar.map((week) => (
              <WeekAccordion
                key={week.week}
                week={week}
                isExpanded={expandedWeeks.has(week.week)}
                onToggle={() => toggleWeek(week.week)}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* KPIs */}
      {data.kpis.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Key Performance Indicators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.kpis.map((kpi, i) => (
                <div key={i} className="rounded-lg border p-3">
                  <div className="text-sm font-medium mb-1">{kpi.metric}</div>
                  <div className="text-lg font-bold text-primary">{kpi.target}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    via {kpi.measurement_tool}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Influencer Strategy */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4" />
            Influencer Strategy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Target:</span>{" "}
              <span className="font-medium">{data.influencer_strategy.target_type}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Budget per influencer:</span>{" "}
              <span className="font-medium">{data.influencer_strategy.budget_per_influencer}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Expected reach:</span>{" "}
              <span className="font-medium">{data.influencer_strategy.expected_reach}</span>
            </div>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">Outreach Template</p>
            <p className="text-sm whitespace-pre-wrap">{data.influencer_strategy.outreach_template}</p>
          </div>
        </CardContent>
      </Card>

      {/* Local SEO Checklist */}
      {data.local_seo_checklist.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Local SEO Checklist
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {data.local_seo_checklist.map((item, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 rounded-md px-2 py-1.5 cursor-pointer transition-colors ${
                  checkedSeo.has(i)
                    ? "bg-green-50/50 text-muted-foreground"
                    : "hover:bg-muted/50"
                }`}
                onClick={() => toggleSeo(i)}
              >
                {checkedSeo.has(i) ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <span
                  className={`text-sm ${checkedSeo.has(i) ? "line-through" : ""}`}
                >
                  {item}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </section>
  );
}

// ── Content Calendar Accordion ───────────────────────────

function WeekAccordion({
  week,
  isExpanded,
  onToggle,
}: {
  week: ContentCalendarWeek;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-lg border">
      <button
        className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-muted/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Week {week.week}</span>
          <span className="text-xs text-muted-foreground">{week.theme}</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {isExpanded && (
        <div className="px-3 pb-3 space-y-2">
          {week.posts.map((post, i) => (
            <div key={i} className="rounded-md bg-muted/30 p-2">
              <div className="flex items-center gap-2 mb-0.5">
                <Badge variant="outline" className="text-xs">
                  {post.platform}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {post.content_type}
                </span>
              </div>
              <p className="text-sm font-medium">{post.topic}</p>
              <p className="text-xs text-muted-foreground italic mt-0.5">
                {post.caption_idea}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
