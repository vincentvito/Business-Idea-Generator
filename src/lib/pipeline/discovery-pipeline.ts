import { generateIdeas } from "@/lib/ai/generate-ideas";
import { fetchBatchKeywordMetrics } from "@/lib/dataforseo/keyword-data";
import { fetchSeedKeywords } from "@/lib/dataforseo/keyword-suggestions";
import { CATEGORY_SEED_KEYWORDS } from "@/lib/constants";
import type { PipelineEvent } from "@/types/pipeline";
import type { KeywordMetrics } from "@/types/validation";
import type { IdeaStub, RankedIdea, DiscoveryFilters } from "@/types/discovery";


export async function runDiscoveryPipeline(
  category: string,
  location: string,
  emit: (event: PipelineEvent) => void,
  filters?: DiscoveryFilters
): Promise<void> {
  // Stage 0: Fetch seed keywords (DataForSEO)
  emit({
    type: "stage_start",
    stage: "seeding",
    message: "Researching market demand...",
  });

  const seeds = CATEGORY_SEED_KEYWORDS[category] ?? category.toLowerCase().split(/\s*[&,]\s*/);
  const seedKeywords = await fetchSeedKeywords(seeds, location);

  emit({
    type: "stage_complete",
    stage: "seeding",
    data: { count: seedKeywords.length },
  });

  // Stage 1: Generate 50 Ideas (Claude, seeded with real keywords)
  emit({
    type: "stage_start",
    stage: "generation",
    message: "Generating business ideas...",
  });

  const allIdeas = await generateIdeas(category, location, filters, seedKeywords);
  emit({
    type: "stage_complete",
    stage: "generation",
    data: allIdeas,
  });

  // Stage 2: Batch Keyword Lookup (DataForSEO)
  emit({
    type: "stage_start",
    stage: "volume_check",
    message: "Checking search volume for all ideas...",
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

  // Stage 3: Rank, filter & identify Goldilocks
  emit({
    type: "stage_start",
    stage: "ranking",
    message: "Finding Goldilocks opportunities...",
  });

  const rankedIdeas = rankIdeas(allIdeas, metricsMap);
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

function rankIdeas(
  ideas: IdeaStub[],
  metricsMap: Map<number, KeywordMetrics[]>
): RankedIdea[] {
  return ideas
    .map((idea) => {
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
    })
    .sort((a, b) => b.score - a.score);
}
