"use client";

import { useCallback, useMemo, useState } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { CategorySelector } from "@/components/discover/category-selector";
import { PipelineProgress } from "@/components/validate/pipeline-progress";
import { IdeaGenerator } from "@/components/discover/idea-generator";
import { DayZeroPlan } from "@/components/discover/day-zero-plan";
import { WaitingInsights } from "@/components/discover/waiting-insights";
import { useSSEStream } from "@/hooks/use-sse-stream";
import { useUsage } from "@/hooks/use-usage";
import { useUser } from "@/hooks/use-user";
import { UsageMeter } from "@/components/paywall/usage-meter";
import { UpgradePrompt } from "@/components/paywall/upgrade-prompt";
import { DISCOVERY_STAGES } from "@/lib/constants";
import type { PipelineEvent } from "@/types/pipeline";
import type { RankedIdea, DiscoveryFilters } from "@/types/discovery";
import type { DayZeroPlan as DayZeroPlanType } from "@/types/discovery";

interface DiscoveryResult {
  ideas: RankedIdea[];
  goldilocksIdeas: RankedIdea[];
  dataSource?: "mock" | "live";
  totalGenerated?: number;
}

interface EnrichResult {
  plan: DayZeroPlanType | null;
}

function transformDiscoveryResult(events: PipelineEvent[]): DiscoveryResult {
  for (const event of events) {
    if (event.type === "stage_complete" && event.stage === "ranking") {
      const data = event.data as {
        ranked: RankedIdea[];
        goldilocks: RankedIdea[];
        dataSource?: "mock" | "live";
        totalGenerated?: number;
      };
      return {
        ideas: data.ranked,
        goldilocksIdeas: data.goldilocks,
        dataSource: data.dataSource,
        totalGenerated: data.totalGenerated,
      };
    }
  }
  return { ideas: [], goldilocksIdeas: [] };
}

function transformEnrichResult(events: PipelineEvent[]): EnrichResult {
  for (const event of events) {
    if (event.type === "stage_complete" && event.stage === "plan") {
      return { plan: event.data as DayZeroPlanType };
    }
  }
  return { plan: null };
}

const stages = DISCOVERY_STAGES.map((s) => ({ id: s.id, label: s.label }));

export default function DiscoverPage() {
  const { isAuthenticated, tier } = useUser();
  const { usage, refresh: refreshUsage } = useUsage();

  const [selectedIdea, setSelectedIdea] = useState<RankedIdea | null>(null);
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [filters, setFilters] = useState<DiscoveryFilters>({});

  const transformDiscovery = useCallback(transformDiscoveryResult, []);
  const transformEnrich = useCallback(transformEnrichResult, []);

  const discovery = useSSEStream<
    { category: string; location: string; filters?: DiscoveryFilters },
    DiscoveryResult
  >("/api/discover/generate", transformDiscovery);

  const enrich = useSSEStream<
    { idea: RankedIdea; category: string; location: string; filters?: DiscoveryFilters },
    EnrichResult
  >("/api/discover/enrich", transformEnrich);

  const completedSet = useMemo(
    () => new Set(discovery.completedStages.keys()),
    [discovery.completedStages]
  );

  const handleSubmit = (cat: string, loc: string, f: DiscoveryFilters) => {
    setCategory(cat);
    setLocation(loc);
    setFilters(f);
    setSelectedIdea(null);
    discovery.start({ category: cat, location: loc, filters: f });
    setTimeout(() => refreshUsage(), 2000);
  };

  const handleSelectIdea = (idea: RankedIdea) => {
    setSelectedIdea((prev) => (prev?.id === idea.id ? null : idea));
  };

  const handleGeneratePlan = () => {
    if (selectedIdea) {
      enrich.start({ idea: selectedIdea, category, location, filters });
    }
  };

  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Idea Generator</h1>
        <p className="text-muted-foreground mt-1">
          Pick a category and location. We&apos;ll generate 50 ideas and find the golden opportunities.
        </p>
      </div>

      {isAuthenticated && usage && (
        <div className="mb-4 max-w-md">
          <UsageMeter
            used={usage.discover.used}
            limit={usage.discover.limit}
            label="Discovery sessions this month"
          />
        </div>
      )}

      {discovery.errorType === "auth_required" && (
        <div className="mb-6 max-w-md">
          <UpgradePrompt feature="discover ideas" type="auth_required" />
        </div>
      )}

      {discovery.errorType === "usage_limit" && (
        <div className="mb-6 max-w-md">
          <UpgradePrompt feature="Unlimited discovery sessions" requiredTier="PRO" type="usage_limit" />
        </div>
      )}

      <CategorySelector
        onSubmit={handleSubmit}
        isRunning={discovery.isRunning}
        onCancel={discovery.cancel}
      />

      {discovery.isRunning && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <PipelineProgress
              stages={stages}
              currentStage={discovery.currentStage}
              completedStages={completedSet}
              error={discovery.error}
              stageMessage={discovery.stageMessage}
              progress={discovery.progress}
            />
          </div>
          <div className="md:col-span-2">
            <WaitingInsights category={category} location={location} />
          </div>
        </div>
      )}

      {discovery.result && discovery.result.ideas.length > 0 && (
        <div className="mt-8 space-y-6">
          <IdeaGenerator
            ideas={discovery.result.ideas}
            onSelectIdea={handleSelectIdea}
            selectedIdeaId={selectedIdea?.id ?? null}
            onGeneratePlan={handleGeneratePlan}
            isGeneratingPlan={enrich.isRunning}
            userTier={tier}
            dataSource={discovery.result.dataSource}
            totalGenerated={discovery.result.totalGenerated}
          />

          {enrich.result?.plan && <DayZeroPlan plan={enrich.result.plan} />}
        </div>
      )}
    </PageContainer>
  );
}
