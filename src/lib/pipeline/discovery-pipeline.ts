import { generateIdeas } from "@/lib/ai/generate-ideas";
import { fetchBatchKeywordMetrics } from "@/lib/dataforseo/keyword-data";
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
 * Last-resort fallback: generates deterministic mock seed keywords when both
 * DataForSEO endpoints return no usable data. Uses the same hash-based
 * approach as generateMockSeedKeywords in keyword-suggestions.ts.
 */
function generateFallbackSeedKeywords(seeds: string[]): SeedKeyword[] {
  function hash(str: string): number {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (h << 5) - h + str.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  }

  const suffixes = ["near me", "service", "best", "business", "startup"];
  const results: SeedKeyword[] = [];

  for (const seed of seeds) {
    const h = hash(seed.toLowerCase());
    results.push({
      keyword: seed,
      search_volume: 15000 + (h % 50000),
      competition: (h % 3 === 0 ? "LOW" : h % 3 === 1 ? "MEDIUM" : "HIGH") as SeedKeyword["competition"],
      cpc: Math.round(((h % 800) + 50) / 100 * 100) / 100,
    });

    for (const suffix of suffixes.slice(0, 3)) {
      const variation = `${seed} ${suffix}`;
      const vh = hash(variation.toLowerCase());
      results.push({
        keyword: variation,
        search_volume: 500 + (vh % 8000),
        competition: (vh % 3 === 0 ? "LOW" : vh % 3 === 1 ? "MEDIUM" : "HIGH") as SeedKeyword["competition"],
        cpc: Math.round(((vh % 600) + 30) / 100 * 100) / 100,
      });
    }
  }

  return results;
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
  const seedKeywords = await fetchSeedKeywords(seeds, location || undefined, languageCodes);

  // Kick off AI generation in the background while stages 1 & 2 show progress
  const backgroundGeneration = generateIdeas(category, location, filters, seedKeywords);
  backgroundGeneration.catch(() => {}); // prevent unhandled rejection warning

  // Pad stage 1 to appear 10-15s
  await randomDelay(10_000, 15_000);

  emit({
    type: "stage_complete",
    stage: "market_research",
    data: { count: seedKeywords.length },
    ...(locationWarning ? { warning: locationWarning } : {}),
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

  // Stage 4: Batch Keyword Lookup — reuse seed data, only call DataForSEO for novel keywords
  emit({
    type: "stage_start",
    stage: "volume_check",
    message: "Validating real Google search demand for each idea...",
  });

  // Build case-insensitive lookup from seed keywords (already have volume/CPC/competition)
  const seedLookup = new Map<string, SeedKeyword>();
  for (const sk of seedKeywords) {
    seedLookup.set(sk.keyword.toLowerCase(), sk);
  }

  // Separate known (seed-matched) vs novel keywords per idea
  const prefilledMetrics = new Map<number, KeywordMetrics[]>();
  const novelKeywordGroups: { ideaId: number; keywords: string[] }[] = [];

  for (const idea of allIdeas) {
    const known: KeywordMetrics[] = [];
    const novel: string[] = [];

    for (const kw of idea.suggested_keywords) {
      const seed = seedLookup.get(kw.toLowerCase());
      if (seed) {
        known.push(seedKeywordToMetrics(seed));
      } else {
        novel.push(kw);
      }
    }

    prefilledMetrics.set(idea.id, known);
    if (novel.length > 0) {
      novelKeywordGroups.push({ ideaId: idea.id, keywords: novel });
    }
  }

  // Only call DataForSEO for truly novel keywords
  let metricsMap: Map<number, KeywordMetrics[]>;
  let metricsSource: "mock" | "live" = "live";

  const hasNovelKeywords = novelKeywordGroups.some((g) => g.keywords.length > 0);

  if (hasNovelKeywords) {
    const { metricsMap: novelMap, source } = await fetchBatchKeywordMetrics(
      novelKeywordGroups, location || undefined, languageCodes
    );
    metricsSource = source;

    // Merge prefilled seed metrics + novel API metrics per idea
    metricsMap = new Map();
    for (const idea of allIdeas) {
      const pre = prefilledMetrics.get(idea.id) ?? [];
      const nov = novelMap.get(idea.id) ?? [];
      metricsMap.set(idea.id, [...pre, ...nov]);
    }
  } else {
    // All keywords matched seed data — no API call needed
    metricsMap = prefilledMetrics;
    console.log("[Discovery] All suggested keywords found in seed data — skipped volume check API call");
  }

  // Safety net: if >70% of ideas got all-zero volume, enrich with fallback data
  const zeroVolumeCount = allIdeas.filter((idea) => {
    const m = metricsMap.get(idea.id) ?? [];
    return m.length === 0 || m.every((k) => k.avg_monthly_searches === 0);
  }).length;

  if (zeroVolumeCount > allIdeas.length * 0.7) {
    const effectiveSeedKeywords = seedKeywords.length > 0
      ? seedKeywords
      : generateFallbackSeedKeywords(seeds);

    console.warn(
      `[Discovery] ${zeroVolumeCount}/${allIdeas.length} ideas have zero volume`,
      seedKeywords.length > 0
        ? "— using seed keyword data directly"
        : "— seedKeywords also empty, using generated fallback data"
    );

    metricsSource = "mock";

    const seedMetrics: KeywordMetrics[] = [...effectiveSeedKeywords]
      .sort((a, b) => b.search_volume - a.search_volume)
      .slice(0, 20)
      .map(seedKeywordToMetrics);

    // Assign 2 seed metrics to each zero-volume idea (round-robin)
    if (seedMetrics.length > 0) {
      for (let i = 0; i < allIdeas.length; i++) {
        const idea = allIdeas[i];
        const existing = metricsMap.get(idea.id) ?? [];
        if (existing.length === 0 || existing.every((k) => k.avg_monthly_searches === 0)) {
          const idx = (i * 2) % seedMetrics.length;
          const fallbacks = [seedMetrics[idx], seedMetrics[(idx + 1) % seedMetrics.length]];
          idea.suggested_keywords.push(...fallbacks.map((f) => f.keyword));
          metricsMap.set(idea.id, [...existing, ...fallbacks]);
        }
      }
    }
  }

  // Final safety check: if ALL ideas still have zero volume, mark source as estimated
  const allZero = allIdeas.every((idea) => {
    const m = metricsMap.get(idea.id) ?? [];
    return m.length === 0 || m.every((k) => k.avg_monthly_searches === 0);
  });
  if (allZero && metricsSource === "live") {
    console.warn("[Discovery] All ideas have zero volume after pipeline — marking source as estimated");
    metricsSource = "mock";
  }

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
