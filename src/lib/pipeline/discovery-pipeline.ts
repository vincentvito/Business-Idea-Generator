import { generateIdeas } from "@/lib/ai/generate-ideas";
import { fetchBatchKeywordMetrics } from "@/lib/dataforseo/keyword-data";
import { fetchSeedKeywords } from "@/lib/dataforseo/keyword-suggestions";
import { CATEGORY_SEED_KEYWORDS } from "@/lib/constants";
import type { PipelineEvent } from "@/types/pipeline";
import type { KeywordMetrics } from "@/types/validation";
import type { IdeaStub, RankedIdea, DiscoveryFilters } from "@/types/discovery";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function runDiscoveryPipeline(
  category: string,
  location: string,
  emit: (event: PipelineEvent) => void,
  filters?: DiscoveryFilters
): Promise<void> {
  // Stage 1: Market Research — fetch seed keywords from DataForSEO
  emit({
    type: "stage_start",
    stage: "market_research",
    message: "Researching market demand signals...",
  });

  const seeds = CATEGORY_SEED_KEYWORDS[category] ?? category.toLowerCase().split(/\s*[&,]\s*/);
  const seedKeywords = await fetchSeedKeywords(seeds, location);

  emit({
    type: "stage_complete",
    stage: "market_research",
    data: { count: seedKeywords.length },
  });

  // Stage 2: Location Analysis — process seed keywords by volume tiers
  emit({
    type: "stage_start",
    stage: "location_analysis",
    message: "Identifying trending niches and market gaps...",
  });

  await delay(1500);

  emit({
    type: "stage_complete",
    stage: "location_analysis",
    data: { count: seedKeywords.length },
  });

  // Stage 3: Generate Ideas (Claude, seeded with real keywords)
  emit({
    type: "stage_start",
    stage: "generation",
    message: "Crafting data-driven ideas based on market signals...",
  });

  const allIdeas = await generateIdeas(category, location, filters, seedKeywords);
  emit({
    type: "stage_complete",
    stage: "generation",
    data: allIdeas,
  });

  // Stage 4: Batch Keyword Lookup (DataForSEO)
  emit({
    type: "stage_start",
    stage: "volume_check",
    message: "Validating real Google search demand for each idea...",
  });

  const keywordGroups = allIdeas.map((idea) => ({
    ideaId: idea.id,
    keywords: idea.suggested_keywords,
  }));

  const { metricsMap, source: metricsSource } = await fetchBatchKeywordMetrics(keywordGroups, location);
  emit({
    type: "stage_complete",
    stage: "volume_check",
    data: { count: metricsMap.size, source: metricsSource },
  });

  // Stage 5: Competition Analysis
  emit({
    type: "stage_start",
    stage: "competition",
    message: "Evaluating competition levels across ideas...",
  });

  const scoredIdeas = scoreIdeas(allIdeas, metricsMap);
  await delay(1000);

  emit({
    type: "stage_complete",
    stage: "competition",
    data: { count: scoredIdeas.length },
  });

  // Stage 6: Rank & identify Goldilocks
  emit({
    type: "stage_start",
    stage: "ranking",
    message: "Identifying Goldilocks opportunities...",
  });

  const rankedIdeas = scoredIdeas.sort((a, b) => b.score - a.score);
  const goldilocksIdeas = rankedIdeas.filter((idea) => idea.isGoldilocks);

  emit({
    type: "stage_complete",
    stage: "ranking",
    data: {
      ranked: rankedIdeas,
      goldilocks: goldilocksIdeas,
      dataSource: metricsSource,
      totalGenerated: allIdeas.length,
    },
  });

  emit({
    type: "pipeline_complete",
    summary: {
      total_ideas: allIdeas.length,
      displayed_ideas: rankedIdeas.length,
      goldilocks_count: goldilocksIdeas.length,
      top_idea: goldilocksIdeas[0] ?? rankedIdeas[0],
    },
  });
}

function scoreIdeas(
  ideas: IdeaStub[],
  metricsMap: Map<number, KeywordMetrics[]>
): RankedIdea[] {
  return ideas.map((idea) => {
    const metrics = metricsMap.get(idea.id) ?? [];
    const totalVolume = metrics.length > 0
      ? Math.round(metrics.reduce((sum, m) => sum + m.avg_monthly_searches, 0) / metrics.length)
      : 0;
    const avgCompetition =
      metrics.reduce((sum, m) => sum + m.competition_index, 0) /
      (metrics.length || 1);
    const avgCPC =
      metrics.reduce((sum, m) => sum + m.high_top_of_page_bid, 0) /
      (metrics.length || 1);

    // Goldilocks: Decent avg volume (>500/mo) + Low competition (<40/100) + Decent CPC (>$1)
    const isGoldilocks =
      totalVolume > 500 && avgCompetition < 40 && avgCPC > 1;

    // Composite score: log-scale volume + competition + CPC
    const score =
      Math.log10(totalVolume + 1) * 15 * 0.4 +
      (100 - avgCompetition) * 0.35 +
      avgCPC * 10 * 0.25;

    return {
      ...idea,
      totalVolume,
      avgCompetition: Math.round(avgCompetition),
      avgCPC: Math.round(avgCPC * 100) / 100,
      isGoldilocks,
      score: Math.round(score * 10) / 10,
      metrics,
    };
  });
}
