"use client";

import { useCallback, useMemo } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { IdeaInputForm } from "@/components/validate/idea-input-form";
import { PipelineProgress } from "@/components/validate/pipeline-progress";
import { ValidationDashboard } from "@/components/validate/validation-dashboard";
import { useSSEStream } from "@/hooks/use-sse-stream";
import { useUsage } from "@/hooks/use-usage";
import { useUser } from "@/hooks/use-user";
import { UsageMeter } from "@/components/paywall/usage-meter";
import { UpgradePrompt } from "@/components/paywall/upgrade-prompt";
import { VALIDATION_STAGES } from "@/lib/constants";
import type { PipelineEvent } from "@/types/pipeline";
import type {
  KeywordExtractionResult,
  KeywordMetrics,
  CompetitorAnalysis,
  MoatAnalysis,
  TrendData,
  AmazonProductData,
  ScoreData,
} from "@/types/validation";

interface ValidationResult {
  keywords: KeywordExtractionResult | null;
  metrics: KeywordMetrics[] | null;
  trends: TrendData[] | null;
  competitors: CompetitorAnalysis[] | null;
  moat: MoatAnalysis | null;
  amazon: AmazonProductData[] | null;
  scores: ScoreData | null;
}

function transformValidationResult(events: PipelineEvent[]): ValidationResult {
  const result: ValidationResult = {
    keywords: null,
    metrics: null,
    trends: null,
    competitors: null,
    moat: null,
    amazon: null,
    scores: null,
  };

  for (const event of events) {
    if (event.type !== "stage_complete") continue;

    switch (event.stage) {
      case "keywords":
        result.keywords = event.data as KeywordExtractionResult;
        break;
      case "metrics": {
        const metricsData = event.data as { metrics: KeywordMetrics[]; source: string };
        result.metrics = metricsData.metrics;
        break;
      }
      case "trends":
        result.trends = event.data as TrendData[];
        break;
      case "competitors": {
        const data = event.data as {
          competitors: CompetitorAnalysis[];
          moat: MoatAnalysis;
        };
        result.competitors = data.competitors;
        result.moat = data.moat;
        break;
      }
      case "ecommerce":
        result.amazon = event.data as AmazonProductData[];
        break;
      case "scoring":
        result.scores = event.data as ScoreData;
        break;
    }
  }

  return result;
}

const stages = VALIDATION_STAGES.map((s) => ({ id: s.id, label: s.label }));

export default function ValidatePage() {
  const transform = useCallback(transformValidationResult, []);

  const { isAuthenticated } = useUser();
  const { usage, refresh: refreshUsage } = useUsage();

  const {
    isRunning,
    currentStage,
    stageMessage,
    progress,
    completedStages,
    stageWarnings,
    error,
    errorType,
    result,
    start: rawStart,
    cancel,
  } = useSSEStream<{ idea: string }, ValidationResult>("/api/validate", transform);

  const start = useCallback(
    (input: { idea: string }) => {
      rawStart(input);
      // Refresh usage after starting (will show updated count once complete)
      setTimeout(() => refreshUsage(), 2000);
    },
    [rawStart, refreshUsage]
  );

  // Derive progressive results from completedStages for real-time display
  const progressiveResult = useMemo((): ValidationResult => {
    if (result) return result;

    const r: ValidationResult = {
      keywords: null,
      metrics: null,
      trends: null,
      competitors: null,
      moat: null,
      amazon: null,
      scores: null,
    };

    const kw = completedStages.get("keywords");
    if (kw) r.keywords = kw as KeywordExtractionResult;

    const met = completedStages.get("metrics");
    if (met) {
      const metricsData = met as { metrics: KeywordMetrics[]; source: string };
      r.metrics = metricsData.metrics;
    }

    const tr = completedStages.get("trends");
    if (tr) r.trends = tr as TrendData[];

    const comp = completedStages.get("competitors");
    if (comp) {
      const data = comp as { competitors: CompetitorAnalysis[]; moat: MoatAnalysis };
      r.competitors = data.competitors;
      r.moat = data.moat;
    }

    const amz = completedStages.get("ecommerce");
    if (amz) r.amazon = amz as AmazonProductData[];

    const sc = completedStages.get("scoring");
    if (sc) r.scores = sc as ScoreData;

    return r;
  }, [result, completedStages]);

  const completedSet = useMemo(
    () => new Set(completedStages.keys()),
    [completedStages]
  );

  const hasAnyResult =
    progressiveResult.keywords ||
    progressiveResult.metrics ||
    progressiveResult.trends ||
    progressiveResult.competitors ||
    progressiveResult.amazon ||
    progressiveResult.scores;

  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-purple-600">
          {isRunning ? "Validating Your Idea…" : "60-Second Reality Check"}
        </h1>
        <p className="text-muted-foreground mt-1">
          Enter a business idea and get instant validation backed by real data.
        </p>
      </div>

      {isAuthenticated && usage && (
        <div className="mb-4 max-w-md">
          <UsageMeter
            used={usage.validate.used}
            limit={usage.validate.limit}
            label="Validations this month"
          />
        </div>
      )}

      {errorType === "auth_required" && (
        <div className="mb-6 max-w-md">
          <UpgradePrompt feature="validate ideas" type="auth_required" />
        </div>
      )}

      {errorType === "usage_limit" && (
        <div className="mb-6 max-w-md">
          <UpgradePrompt feature="Unlimited validations" requiredTier="PRO" type="usage_limit" />
        </div>
      )}

      <IdeaInputForm
        onSubmit={(idea) => start({ idea })}
        isRunning={isRunning}
        onCancel={cancel}
      />

      {isRunning && (
        <div className="mt-6">
          <PipelineProgress
            stages={stages}
            currentStage={currentStage}
            completedStages={completedSet}
            error={error}
            stageMessage={stageMessage}
            progress={progress}
          />
        </div>
      )}

      {hasAnyResult && (
        <div className="mt-8">
          <ValidationDashboard
            keywords={progressiveResult.keywords}
            metrics={progressiveResult.metrics}
            trends={progressiveResult.trends}
            competitors={progressiveResult.competitors}
            moat={progressiveResult.moat}
            amazon={progressiveResult.amazon}
            scores={progressiveResult.scores}
            warnings={stageWarnings}
          />
        </div>
      )}
    </PageContainer>
  );
}
