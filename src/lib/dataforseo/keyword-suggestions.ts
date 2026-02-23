import { isUsingMockData, dataforseoRequest, getLocationCode } from "./client";
import { classifyError, shouldRetry } from "./errors";
import { getCached, setCache } from "./cache";

export interface SeedKeyword {
  keyword: string;
  search_volume: number;
  competition: "LOW" | "MEDIUM" | "HIGH" | "UNSPECIFIED";
  cpc: number;
}

// ─── Mock data ───

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    h = (h << 5) - h + char;
    h |= 0;
  }
  return Math.abs(h);
}

function generateMockSeedKeywords(seeds: string[]): SeedKeyword[] {
  const suffixes = [
    "near me", "service", "app", "online", "cost",
    "best", "cheap", "premium", "business", "startup",
    "subscription", "delivery", "course", "tools", "platform",
  ];
  const results: SeedKeyword[] = [];

  for (const seed of seeds) {
    // Broad seed keyword (high volume)
    const seedHash = hash(seed.toLowerCase());
    results.push({
      keyword: seed,
      search_volume: 15000 + (seedHash % 50000),
      competition: seedHash % 3 === 0 ? "LOW" : seedHash % 3 === 1 ? "MEDIUM" : "HIGH",
      cpc: Math.round(((seedHash % 800) + 50) / 100 * 100) / 100,
    });

    // Generate niche variations (lower volume)
    for (const suffix of suffixes.slice(0, 4)) {
      const variation = `${seed} ${suffix}`;
      const h = hash(variation.toLowerCase());
      results.push({
        keyword: variation,
        search_volume: 500 + (h % 8000),
        competition: h % 3 === 0 ? "LOW" : h % 3 === 1 ? "MEDIUM" : "HIGH",
        cpc: Math.round(((h % 600) + 30) / 100 * 100) / 100,
      });
    }
  }

  return selectMixedKeywords(results);
}

// ─── Live API fetch ───

interface KeywordsForKeywordsResult {
  keyword: string;
  keyword_info?: {
    search_volume?: number | null;
    competition?: string | null;
    competition_index?: number | null;
    cpc?: number | null;
  };
  // Flat format fields
  search_volume?: number | null;
  competition?: string | null;
  competition_index?: number | null;
  cpc?: number | null;
}

function parseResult(r: KeywordsForKeywordsResult): SeedKeyword {
  const volume = r.keyword_info?.search_volume ?? r.search_volume ?? 0;
  const comp = r.keyword_info?.competition ?? r.competition;
  const cpc = r.keyword_info?.cpc ?? r.cpc ?? 0;

  let competition: SeedKeyword["competition"] = "UNSPECIFIED";
  if (typeof comp === "string" && ["LOW", "MEDIUM", "HIGH"].includes(comp)) {
    competition = comp as SeedKeyword["competition"];
  }

  return {
    keyword: r.keyword,
    search_volume: volume,
    competition,
    cpc,
  };
}

/**
 * Selects a mix of high-volume (broad demand signals) and niche keywords
 * instead of just top-N by volume. This gives Claude both big-market and
 * underserved-niche inspiration.
 */
function selectMixedKeywords(keywords: SeedKeyword[]): SeedKeyword[] {
  const sorted = [...keywords].sort((a, b) => b.search_volume - a.search_volume);
  const highVolume = sorted.filter((k) => k.search_volume > 10000).slice(0, 15);
  const niche = sorted
    .filter((k) => k.search_volume >= 500 && k.search_volume <= 10000)
    .slice(0, 15);

  const combined = [...highVolume, ...niche];

  // If we don't have enough in either bucket, fill from the sorted list
  if (combined.length < 20) {
    const existing = new Set(combined.map((k) => k.keyword.toLowerCase()));
    for (const kw of sorted) {
      if (combined.length >= 30) break;
      if (!existing.has(kw.keyword.toLowerCase())) {
        combined.push(kw);
        existing.add(kw.keyword.toLowerCase());
      }
    }
  }

  return combined;
}

async function fetchFromDataForSEO(
  seeds: string[],
  location?: string
): Promise<SeedKeyword[]> {
  const locationCode = location ? getLocationCode(location) : null;

  const task = {
    keywords: seeds,
    ...(locationCode ? { location_code: locationCode } : {}),
    language_code: "en",
    search_partners: false,
    limit: 50,
    sort_by: "search_volume",
  };

  const response = await dataforseoRequest<KeywordsForKeywordsResult>(
    "keywords_data/google_ads/keywords_for_keywords/live",
    [task]
  );

  const results = response.tasks?.[0]?.result ?? [];

  const parsed = results
    .map(parseResult)
    .filter((r) => r.search_volume > 0);

  return selectMixedKeywords(parsed);
}

// ─── Public API ───

export async function fetchSeedKeywords(
  seeds: string[],
  location?: string
): Promise<SeedKeyword[]> {
  if (isUsingMockData()) {
    await new Promise((r) => setTimeout(r, 300));
    return generateMockSeedKeywords(seeds);
  }

  // Check cache
  const cacheKey = seeds.sort().join(",");
  const cached = getCached<SeedKeyword[]>("seed", cacheKey, location);
  if (cached) return cached;

  try {
    const results = await fetchFromDataForSEO(seeds, location);
    setCache("seed", cacheKey, location, results);
    return results;
  } catch (error) {
    const classified = classifyError(error);
    console.error(`[DataForSEO Seeds] ${classified.type}: ${classified.message}`);

    if (shouldRetry(error)) {
      await new Promise((r) => setTimeout(r, 2000));
      try {
        const results = await fetchFromDataForSEO(seeds, location);
        setCache("seed", cacheKey, location, results);
        return results;
      } catch (retryError) {
        console.error("[DataForSEO Seeds] Retry failed:", classifyError(retryError).message);
      }
    }

    console.warn("[DataForSEO Seeds] Falling back to mock data.");
    return generateMockSeedKeywords(seeds);
  }
}
