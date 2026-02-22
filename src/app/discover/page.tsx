"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SectionBand } from "@/components/layout/section-band";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CategorySelector } from "@/components/discover/category-selector";
import { PipelineProgress } from "@/components/validate/pipeline-progress";
import { IdeaGenerator } from "@/components/discover/idea-generator";
import { DayZeroPlan } from "@/components/discover/day-zero-plan";
import { WaitingInsights } from "@/components/discover/waiting-insights";
import { LiveFeed } from "@/components/home/live-feed";
import { useSSEStream } from "@/hooks/use-sse-stream";
import { useUsage } from "@/hooks/use-usage";
import { useUser } from "@/hooks/use-user";
import { UsageMeter } from "@/components/paywall/usage-meter";
import { UpgradePrompt } from "@/components/paywall/upgrade-prompt";
import { DISCOVERY_STAGES } from "@/lib/constants";
import {
  Sparkles,
  Lightbulb,
  Compass,
  Trophy,
  BarChart3,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
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

const HOW_IT_WORKS = [
  { step: 1, icon: Compass, title: "Pick Category & Location", desc: "Choose from 20+ business categories and your target market" },
  { step: 2, icon: Sparkles, title: "AI Generates 50 Ideas", desc: "Each idea validated with real Google search data" },
  { step: 3, icon: Trophy, title: "Find Golden Opportunities", desc: "Ranked by demand, competition & profit potential" },
] as const;

const FEATURES = [
  {
    icon: Lightbulb,
    color: "text-yellow-500",
    bg: "bg-yellow-50",
    title: "50 Business Ideas",
    desc: "AI-generated ideas tailored to your category, location, and preferences",
  },
  {
    icon: BarChart3,
    color: "text-blue-500",
    bg: "bg-blue-50",
    title: "Real Market Data",
    desc: "Each idea validated with actual Google search volume and competition metrics",
  },
  {
    icon: Star,
    color: "text-purple-500",
    bg: "bg-purple-50",
    title: "Golden Opportunities",
    desc: "Top ideas highlighted with high demand, low competition, and strong monetization",
  },
] as const;

const MINI_STATS = [
  { label: "Ideas Generated", value: "12,847", icon: Lightbulb, color: "text-yellow-500" },
  { label: "Golden Finds", value: "2,340", icon: Star, color: "text-purple-500" },
] as const;

export default function DiscoverPage() {
  const router = useRouter();
  const { isAuthenticated, tier } = useUser();
  const { usage, refresh: refreshUsage } = useUsage();
  const [isStartingDeepDive, startDeepDiveTransition] = useTransition();

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

  const handleDeepDive = (idea: RankedIdea) => {
    startDeepDiveTransition(async () => {
      try {
        const res = await fetch("/api/stripe/checkout-deep-dive", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ideaData: idea,
            category,
            location,
            filters,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          if (data.error === "Unauthorized") {
            router.push("/login");
            return;
          }
          throw new Error(data.error ?? "Checkout failed");
        }
        // In bypass mode, url is a relative path; otherwise it's a Stripe URL
        if (data.bypass) {
          router.push(data.url);
        } else {
          window.location.href = data.url;
        }
      } catch (err) {
        console.error("Deep dive checkout failed:", err);
      }
    });
  };

  const showPreContent = !discovery.isRunning && !discovery.result;

  return (
    <main>
      {/* Band 1: Purple Gradient Hero */}
      <SectionBand
        className="bg-gradient-to-b from-purple-600 via-purple-700 to-purple-900 text-white"
        innerClassName="pt-10 pb-8 sm:pt-12 sm:pb-10"
      >
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-yellow-300" />
            <span>AI-powered idea discovery</span>
          </div>
        </div>

        <div className="flex flex-col items-center text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Discover Your Next{" "}
            <span className="text-yellow-300">Business Idea</span>
          </h1>
          <p className="mt-3 max-w-2xl text-base text-purple-100 sm:text-lg">
            Pick a category and location. Our AI generates 50 ideas, validates
            them with real search data, and highlights the golden opportunities.
          </p>
        </div>
      </SectionBand>

      {/* Band 2: Form Section */}
      <SectionBand innerClassName="py-8">
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Configure Your Search
            </CardTitle>
            <CardDescription>
              Choose a business category and target market location to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CategorySelector
              onSubmit={handleSubmit}
              isRunning={discovery.isRunning}
              onCancel={discovery.cancel}
            />
          </CardContent>
        </Card>
      </SectionBand>

      {/* Pre-content: shown only when idle (no running/results) */}
      {showPreContent && (
        <>
          {/* Band 3: How It Works */}
          <SectionBand className="bg-muted" innerClassName="py-10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              {HOW_IT_WORKS.map((s) => (
                <div key={s.step} className="flex flex-col items-center">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-700 font-bold text-sm">
                    {s.step}
                  </div>
                  <s.icon className="h-5 w-5 text-purple-600 mb-2" />
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

          {/* Band 5: Trending Preview + Social Proof */}
          <SectionBand className="bg-muted" innerClassName="py-10">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="md:col-span-3">
                <h2 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Trending Right Now
                </h2>
                <WaitingInsights category="" location="" variant="preview" />
              </div>
              <div className="md:col-span-2 space-y-4">
                <h2 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  Community Activity
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
                <LiveFeed />
              </div>
            </div>
          </SectionBand>
        </>
      )}

      {/* Running state */}
      {discovery.isRunning && (
        <SectionBand innerClassName="py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        </SectionBand>
      )}

      {/* Results */}
      {discovery.result && discovery.result.ideas.length > 0 && (
        <SectionBand innerClassName="py-8">
          <div className="space-y-6">
            <IdeaGenerator
              ideas={discovery.result.ideas}
              onSelectIdea={handleSelectIdea}
              selectedIdeaId={selectedIdea?.id ?? null}
              onGeneratePlan={handleGeneratePlan}
              isGeneratingPlan={enrich.isRunning}
              onDeepDive={handleDeepDive}
              isStartingDeepDive={isStartingDeepDive}
              userTier={tier}
              dataSource={discovery.result.dataSource}
              totalGenerated={discovery.result.totalGenerated}
            />

            {enrich.result?.plan && <DayZeroPlan plan={enrich.result.plan} />}
          </div>
        </SectionBand>
      )}
    </main>
  );
}
