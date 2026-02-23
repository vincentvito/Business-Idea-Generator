"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Map, Search, Hammer, Rocket, BarChart3, Clock, CheckCircle2, Circle } from "lucide-react";
import type { ValidationRoadmap, RoadmapStep } from "@/types/deep-dive";

const CATEGORY_CONFIG: Record<string, { icon: typeof Search; color: string; bg: string }> = {
  research: { icon: Search, color: "text-blue-600", bg: "bg-blue-100" },
  build: { icon: Hammer, color: "text-orange-600", bg: "bg-orange-100" },
  launch: { icon: Rocket, color: "text-green-600", bg: "bg-green-100" },
  measure: { icon: BarChart3, color: "text-[#1A4A3A]", bg: "bg-[#E8F0ED]" },
};

interface ValidationRoadmapSectionProps {
  data: ValidationRoadmap;
  deepDiveId?: string;
}

export function ValidationRoadmapSection({
  data,
  deepDiveId,
}: ValidationRoadmapSectionProps) {
  const storageKey = `deep-dive-roadmap-${deepDiveId ?? "default"}`;

  const [checkedSteps, setCheckedSteps] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setCheckedSteps(new Set(JSON.parse(saved)));
    } catch { /* ignore */ }
  }, [storageKey]);

  const toggleStep = (stepId: string) => {
    setCheckedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      localStorage.setItem(storageKey, JSON.stringify([...next]));
      return next;
    });
  };

  const totalSteps = data.phases.reduce((sum, p) => sum + p.steps.length, 0);
  const completedSteps = data.phases.reduce(
    (sum, p) => sum + p.steps.filter((s) => checkedSteps.has(s.id)).length,
    0
  );
  const progressPercent = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Map className="h-5 w-5 text-indigo-500" />
          Validation Roadmap
        </h2>
        <div className="text-sm text-muted-foreground">
          {data.total_estimated_weeks} weeks &middot; {data.total_estimated_budget}
        </div>
      </div>

      {/* Progress bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium">
              {completedSteps} of {totalSteps} steps completed
            </span>
            <span className="text-muted-foreground">
              {Math.round(progressPercent)}%
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </CardContent>
      </Card>

      {/* Phases */}
      {data.phases.map((phase) => (
        <Card key={phase.phase}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Phase {phase.phase}: {phase.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {phase.steps.map((step) => (
              <StepItem
                key={step.id}
                step={step}
                isChecked={checkedSteps.has(step.id)}
                onToggle={() => toggleStep(step.id)}
              />
            ))}
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

function StepItem({
  step,
  isChecked,
  onToggle,
}: {
  step: RoadmapStep;
  isChecked: boolean;
  onToggle: () => void;
}) {
  const config = CATEGORY_CONFIG[step.category] ?? CATEGORY_CONFIG.research;
  const Icon = config.icon;

  return (
    <div
      className={`rounded-lg border p-3 transition-colors cursor-pointer ${
        isChecked ? "bg-green-50/50 border-green-200" : "hover:bg-muted/50"
      }`}
      onClick={onToggle}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">
          {isChecked ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-medium text-sm ${isChecked ? "line-through text-muted-foreground" : ""}`}>
              {step.title}
            </span>
            <Badge className={`${config.bg} ${config.color} text-xs`}>
              <Icon className="h-3 w-3 mr-1" />
              {step.category}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-0.5 ml-auto shrink-0">
              <Clock className="h-3 w-3" />
              Week {step.week} &middot; {step.estimated_hours}h
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
          <ul className="text-sm space-y-1">
            {step.action_items.map((item, i) => (
              <li key={i} className="flex gap-1.5">
                <span className="text-muted-foreground shrink-0">&bull;</span>
                {item}
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground mt-1.5 italic">
            Success: {step.success_criteria}
          </p>
        </div>
      </div>
    </div>
  );
}
