"use client";

import { useCallback, useMemo } from "react";
import { SectionBand } from "@/components/layout/section-band";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { IdeaInputForm } from "@/components/validate/idea-input-form";
import { PipelineProgress } from "@/components/validate/pipeline-progress";
import { ValidationDashboard } from "@/components/validate/validation-dashboard";
import { LiveFeed } from "@/components/home/live-feed";
import { useSSEStream } from "@/hooks/use-sse-stream";
import { useUsage } from "@/hooks/use-usage";
import { useUser } from "@/hooks/use-user";
import { UsageMeter } from "@/components/paywall/usage-meter";
import { UpgradePrompt } from "@/components/paywall/upgrade-prompt";
import { VALIDATION_STAGES } from "@/lib/constants";
import {
  ShieldCheck,
  Sparkles,
  Lightbulb,
  Target,
  BarChart3,
  Users,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import type { PipelineEvent } from "@/types/pipeline";
import type {
  KeywordExtractionResult,
  KeywordMetrics,
  CompetitorAnalysis,
  MoatAnalysis,
  TrendData,
  AmazonProductData,
  LocalCompetitionData,
  ScoreData,
} from "@/types/validation";

interface ValidationResult {
  keywords: KeywordExtractionResult | null;
  metrics: KeywordMetrics[] | null;
  trends: TrendData[] | null;
  competitors: CompetitorAnalysis[] | null;
  moat: MoatAnalysis | null;
  amazon: AmazonProductData[] | null;
  localCompetition: LocalCompetitionData | null;
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
    localCompetition: null,
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
      case "local_competition":
        result.localCompetition = event.data as LocalCompetitionData | null;
        break;
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

const HOW_IT_WORKS = [
  { step: 1, icon: Lightbulb, title: "Describe Your Food Idea", desc: "Tell us about your food business concept in a few sentences" },
  { step: 2, icon: Sparkles, title: "AI Analyzes Everything", desc: "Keywords, search volume, food trends, competitors & market data" },
  { step: 3, icon: Target, title: "Get Your Verdict", desc: "A data-backed score with actionable insights" },
] as const;

const FEATURES = [
  {
    icon: BarChart3,
    color: "text-blue-500",
    bg: "bg-blue-50",
    title: "Search Volume Data",
    desc: "Real Google search metrics for your idea's keywords",
  },
  {
    icon: Users,
    color: "text-yellow-500",
    bg: "bg-yellow-50",
    title: "Competitor Analysis",
    desc: "See who you're up against and where the gaps are",
  },
  {
    icon: Target,
    color: "text-[#1A4A3A]",
    bg: "bg-[#E8F0ED]",
    title: "Viability Score",
    desc: "An overall score with breakdown across key dimensions",
  },
] as const;

const MINI_STATS = [
  { label: "Food Ideas Validated", value: "8,412", icon: CheckCircle, color: "text-green-500" },
  { label: "Average Score", value: "72/100", icon: Target, color: "text-[#1A4A3A]" },
] as const;

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
      setTimeout(() => refreshUsage(), 2000);
    },
    [rawStart, refreshUsage]
  );

  const progressiveResult = useMemo((): ValidationResult => {
    if (result) return result;

    const r: ValidationResult = {
      keywords: null,
      metrics: null,
      trends: null,
      competitors: null,
      moat: null,
      amazon: null,
      localCompetition: null,
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

    const loc = completedStages.get("local_competition");
    if (loc) r.localCompetition = loc as LocalCompetitionData | null;

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
    progressiveResult.localCompetition ||
    progressiveResult.amazon ||
    progressiveResult.scores;

  const showPreContent = !isRunning && !hasAnyResult;

  return (
    <main>
      {/* Band 1: Deep Forest Gradient Hero */}
      <SectionBand
        className="bg-gradient-to-b from-[#145C42] via-[#0F4A35] to-[#0D2C24] text-white"
        innerClassName="pt-10 pb-8 sm:pt-12 sm:pb-10"
      >
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm backdrop-blur-sm">
            <ShieldCheck className="h-4 w-4 text-[#FFC107]" />
            <span>AI-powered food business validation</span>
          </div>
        </div>

        <div className="flex flex-col items-center text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            60-Second{" "}
            <span className="text-[#FFC859]">Reality Check</span>
          </h1>
          <p className="mt-3 max-w-2xl text-base text-white/70 sm:text-lg">
            Enter your food business idea and get instant validation backed by real
            search data, trend analysis, and competitor intelligence.
          </p>
        </div>
      </SectionBand>

      {/* Band 2: Form Section */}
      <SectionBand innerClassName="py-8">
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

        {error && errorType !== "auth_required" && errorType !== "usage_limit" && (
          <Card className="mb-4 border-destructive/50 bg-destructive/5">
            <CardContent className="flex items-start gap-3 py-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm text-destructive">Something went wrong</p>
                <p className="mt-1 text-sm text-muted-foreground">{error}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Please check your inputs and try again. If the problem persists, the service may be temporarily unavailable.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              {isRunning ? "Validating Your Idea…" : "Describe Your Idea"}
            </CardTitle>
            <CardDescription>
              Tell us about your food business concept and we&apos;ll analyze it against real market data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <IdeaInputForm
              onSubmit={(idea) => start({ idea })}
              isRunning={isRunning}
              onCancel={cancel}
            />
          </CardContent>
        </Card>
      </SectionBand>

      {/* Pre-content: shown only when idle */}
      {showPreContent && (
        <>
          {/* Band 3: How It Works */}
          <SectionBand className="bg-muted" innerClassName="py-10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              {HOW_IT_WORKS.map((s) => (
                <div key={s.step} className="flex flex-col items-center">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#D4E3DA] text-[#0D2C24] font-bold text-sm">
                    {s.step}
                  </div>
                  <s.icon className="h-5 w-5 text-[#1A4A3A] mb-2" />
                  <h3 className="font-medium text-sm">{s.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
                </div>
              ))}
            </div>
          </SectionBand>

          {/* Band 4: What You'll Get */}
          <SectionBand innerClassName="py-10">
            <h2 className="text-center text-lg font-semibold mb-6">What You&apos;ll Get</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {FEATURES.map((f) => (
                <div key={f.title} className="rounded-xl border bg-card p-5 text-center">
                  <div className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${f.bg}`}>
                    <f.icon className={`h-5 w-5 ${f.color}`} />
                  </div>
                  <h3 className="font-medium text-sm">{f.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1.5">{f.desc}</p>
                </div>
              ))}
            </div>
          </SectionBand>

          {/* Band 5: Stats + Social Proof */}
          <SectionBand className="bg-muted" innerClassName="py-10">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="md:col-span-3">
                <h2 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Recent Validations
                </h2>
                <LiveFeed />
              </div>
              <div className="md:col-span-2 space-y-4">
                <h2 className="font-semibold mb-3 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-[#1A4A3A]" />
                  Platform Stats
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {MINI_STATS.map((s) => (
                    <div key={s.label} className="rounded-lg border bg-card p-3 text-center">
                      <s.icon className={`mx-auto mb-1 h-4 w-4 ${s.color}`} />
                      <p className="text-lg font-bold">{s.value}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SectionBand>
        </>
      )}

      {/* Running state */}
      {isRunning && (
        <SectionBand innerClassName="py-8">
          <PipelineProgress
            stages={stages}
            currentStage={currentStage}
            completedStages={completedSet}
            error={error}
            stageMessage={stageMessage}
            progress={progress}
          />
        </SectionBand>
      )}

      {/* Results */}
      {hasAnyResult && (
        <SectionBand innerClassName="py-8">
          <ValidationDashboard
            keywords={progressiveResult.keywords}
            metrics={progressiveResult.metrics}
            trends={progressiveResult.trends}
            competitors={progressiveResult.competitors}
            moat={progressiveResult.moat}
            amazon={progressiveResult.amazon}
            localCompetition={progressiveResult.localCompetition}
            scores={progressiveResult.scores}
            warnings={stageWarnings}
          />
        </SectionBand>
      )}
    </main>
  );
}
