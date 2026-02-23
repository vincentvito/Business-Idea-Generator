"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SectionBand } from "@/components/layout/section-band";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CategorySelector } from "@/components/discover/category-selector";
import { PipelineProgress } from "@/components/validate/pipeline-progress";
import { IdeaGenerator } from "@/components/discover/idea-generator";
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
  Star,
  TrendingUp,
  Users,
  CheckCircle2,
  PenTool,
  FileText,
  Palette,
  Swords,
  AlertTriangle,
} from "lucide-react";
import type { PipelineEvent } from "@/types/pipeline";
import type { RankedIdea, DiscoveryFilters } from "@/types/discovery";
import { AUTH_BYPASS_ENABLED } from "@/lib/auth/bypass-client";

interface DiscoveryResult {
  ideas: RankedIdea[];
  goldilocksIdeas: RankedIdea[];
  dataSource?: "mock" | "live";
  totalGenerated?: number;
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

function getStages(category: string, location: string) {
  return DISCOVERY_STAGES.map((s) => ({
    id: s.id,
    label: s.label
      .replace("{category}", category || "food")
      .replace("{location}", location || "your area"),
  }));
}

const HOW_IT_WORKS = [
  { step: 1, icon: Compass, title: "Pick Food Type & Location", desc: "Choose from 12 food & beverage categories and your target market" },
  { step: 2, icon: Sparkles, title: "AI Generates 50 Ideas", desc: "Each food business idea validated with real Google search data" },
  { step: 3, icon: Trophy, title: "Find Golden Opportunities", desc: "Ranked by demand, competition & profit potential" },
] as const;

const FEATURES = [
  {
    icon: CheckCircle2,
    color: "text-green-500",
    bg: "bg-green-50",
    title: "Validated Business Idea",
    desc: "50 AI-generated ideas, each validated with real Google search volume and local competition data",
  },
  {
    icon: PenTool,
    color: "text-pink-500",
    bg: "bg-pink-50",
    title: "Brand Name & Logo",
    desc: "Creative name suggestions with taglines, domain ideas, and AI-generated logo concepts",
    tier: "Deep Dive",
  },
  {
    icon: FileText,
    color: "text-blue-500",
    bg: "bg-blue-50",
    title: "Full Business Plan",
    desc: "Executive summary, mission & vision, target market analysis, financial projections, and competitive advantage",
    tier: "Deep Dive",
  },
  {
    icon: Palette,
    color: "text-[#1A4A3A]",
    bg: "bg-[#E8F0ED]",
    title: "Visual Moodboard",
    desc: "AI-generated brand imagery, color palette, logo, and style keywords to bring your brand to life",
    tier: "Deep Dive",
  },
  {
    icon: Swords,
    color: "text-red-500",
    bg: "bg-red-50",
    title: "Competition Analysis",
    desc: "Competitor mapping, your differentiators, risk assessment, and a devil\u2019s advocate review",
    tier: "Deep Dive",
  },
] as const;

const MINI_STATS = [
  { label: "Food Ideas Generated", value: "12,847", icon: Lightbulb, color: "text-yellow-500" },
  { label: "Golden Finds", value: "2,340", icon: Star, color: "text-[#1A4A3A]" },
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

  const discovery = useSSEStream<
    { category: string; location: string; filters?: DiscoveryFilters },
    DiscoveryResult
  >("/api/discover/generate", transformDiscovery);

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
  const hasGenericError = !!(
    discovery.error &&
    discovery.errorType !== "auth_required" &&
    discovery.errorType !== "usage_limit"
  );

  return (
    <main>
      {/* Band 1: Deep Forest Gradient Hero */}
      <SectionBand
        className="bg-gradient-to-b from-[#145C42] via-[#0F4A35] to-[#0D2C24] text-white"
        innerClassName="pt-10 pb-8 sm:pt-12 sm:pb-10"
      >
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-[#FFC107]" />
            <span>AI-powered food business discovery</span>
          </div>
        </div>

        <div className="flex flex-col items-center text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Discover Your Next{" "}
            <span className="text-[#FFC859]">Food Business</span>
          </h1>
          <p className="mt-3 max-w-2xl text-base text-white/70 sm:text-lg">
            Pick a food category and location. Our AI generates 50 food &
            beverage ideas, validates them with real market data, and highlights
            the golden opportunities.
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
              Choose a food business type and target market location to get started
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

        {hasGenericError && (
          <Card className="mt-4 border-destructive/50 bg-destructive/5">
            <CardContent className="flex items-start gap-3 py-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm text-destructive">
                  Something went wrong
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {discovery.error}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Please check your inputs and try again. If the problem persists, the service may be temporarily unavailable.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </SectionBand>

      {/* Pre-content: shown only when idle (no running/results) */}
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
            <h2 className="text-center text-xl font-semibold mb-2">
              Everything You Need to Launch
            </h2>
            <p className="text-center text-sm text-muted-foreground mb-8 max-w-2xl mx-auto">
              From validated idea to full business plan — get everything to go from zero to launch.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURES.map((f) => (
                <div key={f.title} className="rounded-xl border bg-card p-5 text-center">
                  <div className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${f.bg}`}>
                    <f.icon className={`h-5 w-5 ${f.color}`} />
                  </div>
                  <h3 className="font-medium text-sm">{f.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1.5">{f.desc}</p>
                  {"tier" in f && (
                    <span className="mt-3 inline-block text-[10px] font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                      {AUTH_BYPASS_ENABLED ? "Free Deep Dive (Test)" : "$29.99 Deep Dive"}
                    </span>
                  )}
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
                  <Users className="h-4 w-4 text-[#1A4A3A]" />
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
              <h3 className="text-sm font-semibold mb-3">
                Generating {category} business ideas
              </h3>
              <PipelineProgress
                stages={getStages(category, location)}
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
              onDeepDive={handleDeepDive}
              isStartingDeepDive={isStartingDeepDive}
              userTier={tier}
              dataSource={discovery.result.dataSource}
              totalGenerated={discovery.result.totalGenerated}
            />
          </div>
        </SectionBand>
      )}
    </main>
  );
}
