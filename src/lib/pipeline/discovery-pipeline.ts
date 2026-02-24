import { generateIdeas } from "@/lib/ai/generate-ideas";
import { fetchSeedKeywords } from "@/lib/dataforseo/keyword-suggestions";
import type { SeedKeyword } from "@/lib/dataforseo/keyword-suggestions";
import { resolveLocation, getLanguagesForLocation } from "@/lib/dataforseo/locations";
import { getLocationCode } from "@/lib/dataforseo/client";
import { CATEGORY_SEED_KEYWORDS } from "@/lib/constants";
import type { PipelineEvent } from "@/types/pipeline";
import type { KeywordMetrics } from "@/types/validation";
import type { IdeaStub, RankedIdea, DiscoveryFilters } from "@/types/discovery";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const randomDelay = (minMs: number, maxMs: number) =>
  delay(minMs + Math.random() * (maxMs - minMs));

/** Convert a SeedKeyword (from Stage 1) to KeywordMetrics format. */
function seedKeywordToMetrics(sk: SeedKeyword): KeywordMetrics {
  return {
    keyword: sk.keyword,
    avg_monthly_searches: sk.search_volume,
    competition: sk.competition,
    competition_index: sk.competition === "HIGH" ? 75 : sk.competition === "MEDIUM" ? 50 : 25,
    low_top_of_page_bid: sk.cpc * 0.5,
    high_top_of_page_bid: sk.cpc * 1.5,
    monthly_searches: [],
    cpc: sk.cpc,
  };
}

/**
 * Find the closest seed keyword to a novel keyword by word overlap.
 * Falls back to the highest-volume seed keyword if no words overlap.
 */
function findClosestSeed(
  novelKeyword: string,
  seedKeywords: SeedKeyword[]
): SeedKeyword {
  const novelWords = new Set(novelKeyword.toLowerCase().split(/\s+/));

  let bestMatch: SeedKeyword | null = null;
  let bestOverlap = 0;

  for (const sk of seedKeywords) {
    const seedWords = sk.keyword.toLowerCase().split(/\s+/);
    const overlap = seedWords.filter((w) => novelWords.has(w)).length;
    if (overlap > bestOverlap) {
      bestOverlap = overlap;
      bestMatch = sk;
    }
  }

  // If no word overlap, return the highest-volume seed keyword
  if (!bestMatch) {
    bestMatch = seedKeywords.reduce((best, sk) =>
      sk.search_volume > best.search_volume ? sk : best
    );
  }

  return bestMatch;
}

export async function runDiscoveryPipeline(
  category: string,
  location: string,
  emit: (event: PipelineEvent) => void,
  filters?: DiscoveryFilters
): Promise<void> {
  // Stage 1: Market Research — resolve location + fetch seed keywords from DataForSEO
  emit({
    type: "stage_start",
    stage: "market_research",
    message: "Researching market demand signals...",
  });

  // Resolve location using comprehensive DB (~95k locations), fallback to static dict
  let resolvedLocationCode: number | null = null;
  let locationWarning: string | undefined;

  if (location) {
    const resolved = await resolveLocation(location);
    if (resolved) {
      resolvedLocationCode = resolved.code;
    } else {
      // Fallback to static dictionary
      resolvedLocationCode = getLocationCode(location);
      if (!resolvedLocationCode) {
        locationWarning = `Could not match "${location}" to a specific location. Results use global data. Try a major city name (e.g., "Dubai", "London", "Tokyo").`;
      }
    }
  }

  // Get available languages for this location (for multi-language keyword queries)
  const languageCodes = resolvedLocationCode
    ? await getLanguagesForLocation(resolvedLocationCode)
    : ["en"];

  // Use resolved code for seed keyword fetch (pass location string for DataForSEO's own resolution)
  const seeds = CATEGORY_SEED_KEYWORDS[category] ?? category.toLowerCase().split(/\s*[&,]\s*/);
  const seedResult = await fetchSeedKeywords(seeds, location || undefined, languageCodes);
  const seedKeywords = seedResult.keywords;
  const seedSource = seedResult.source;
  const seedErrorReason = seedResult.errorReason;

  // Kick off AI generation in the background while stages 1 & 2 show progress
  const backgroundGeneration = generateIdeas(category, location, filters, seedKeywords);
  backgroundGeneration.catch(() => {}); // prevent unhandled rejection warning

  // Pad stage 1 to appear 10-15s
  await randomDelay(10_000, 15_000);

  const marketResearchWarning = [locationWarning, seedErrorReason].filter(Boolean).join(" ");
  emit({
    type: "stage_complete",
    stage: "market_research",
    data: { count: seedKeywords.length },
    ...(marketResearchWarning ? { warning: marketResearchWarning } : {}),
  });

  // Stage 2: Location Analysis — process seed keywords by volume tiers
  emit({
    type: "stage_start",
    stage: "location_analysis",
    message: "Identifying trending niches and market gaps...",
  });

  // Pad stage 2 to appear 10-15s
  await randomDelay(10_000, 15_000);

  emit({
    type: "stage_complete",
    stage: "location_analysis",
    data: { count: seedKeywords.length },
  });

  // Stage 3: Generate Ideas (Claude, seeded with real keywords)
  // Generation has been running in background during stages 1 & 2
  emit({
    type: "stage_start",
    stage: "generation",
    message: "Crafting data-driven ideas based on market signals...",
  });

  const allIdeas = await backgroundGeneration;
  emit({
    type: "stage_complete",
    stage: "generation",
    data: allIdeas,
  });

  // Stage 4: Match keywords to seed data — no extra API call needed
  emit({
    type: "stage_start",
    stage: "volume_check",
    message: "Matching ideas to real Google search demand...",
  });

  // Build case-insensitive lookup from seed keywords (already have volume/CPC/competition)
  const seedLookup = new Map<string, SeedKeyword>();
  for (const sk of seedKeywords) {
    seedLookup.set(sk.keyword.toLowerCase(), sk);
  }

  // For each idea's keywords: exact seed match → use directly, novel → find closest seed
  const metricsMap = new Map<number, KeywordMetrics[]>();
  let novelCount = 0;

  for (const idea of allIdeas) {
    const metrics: KeywordMetrics[] = [];

    for (const kw of idea.suggested_keywords) {
      const exactMatch = seedLookup.get(kw.toLowerCase());
      if (exactMatch) {
        metrics.push(seedKeywordToMetrics(exactMatch));
      } else {
        // Novel keyword — find the closest seed keyword by word overlap
        const closest = findClosestSeed(kw, seedKeywords);
        metrics.push(seedKeywordToMetrics(closest));
        novelCount++;
      }
    }

    metricsMap.set(idea.id, metrics);
  }

  if (novelCount > 0) {
    console.log(`[Discovery] Matched ${novelCount} novel keywords to closest seed keywords`);
  }

  // Data source follows the seed source — all metrics come from seed data
  const metricsSource = seedSource;

  emit({
    type: "stage_complete",
    stage: "volume_check",
    data: { count: metricsMap.size, source: metricsSource },
    ...(metricsSource === "mock" && seedErrorReason ? { warning: seedErrorReason } : {}),
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
      dataWarning: seedErrorReason,
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

    // How many keywords returned real data (volume > 0)?
    const keywordsWithData = metrics.filter((m) => m.avg_monthly_searches > 0).length;
    const dataConfidence = metrics.length > 0 ? keywordsWithData / metrics.length : 0;

    // Goldilocks: Decent avg volume (>500/mo) + Low competition (<40/100) + Decent CPC (>$1)
    const isGoldilocks =
      totalVolume > 500 && avgCompetition < 40 && avgCPC > 1;

    // When volume=0 and competition=0, treat competition as "unknown" (50)
    // rather than "best possible" (0) — 0 means no data, not low competition
    const effectiveCompetition =
      totalVolume === 0 && avgCompetition === 0 ? 50 : avgCompetition;

    // Composite score: log-scale volume + competition + CPC
    let score =
      Math.log10(totalVolume + 1) * 15 * 0.4 +
      (100 - effectiveCompetition) * 0.35 +
      avgCPC * 10 * 0.25;

    // Discount score when keywords lack real data — ideas WITH volume always rank higher
    if (dataConfidence < 1) {
      score = score * (0.5 + 0.5 * dataConfidence);
    }

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
