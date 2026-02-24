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
  location?: string,
  languageCode: string = "en"
): Promise<SeedKeyword[]> {
  const locationCode = location ? getLocationCode(location) : null;

  const task = {
    keywords: seeds,
    ...(locationCode ? { location_code: locationCode } : {}),
    language_code: languageCode,
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

  // Treat zero usable results as a failure so the caller's catch block
  // triggers the existing mock-data fallback.
  if (parsed.length === 0) {
    console.warn(
      "[DataForSEO Seeds] API returned no keywords with volume > 0.",
      "Raw result count:", results.length,
      "Seeds queried:", seeds.slice(0, 5)
    );
    throw new Error("DataForSEO returned no seed keywords with positive search volume");
  }

  return selectMixedKeywords(parsed);
}

// ─── Public API ───

export interface SeedKeywordsResult {
  keywords: SeedKeyword[];
  source: "live" | "mock";
}

export async function fetchSeedKeywords(
  seeds: string[],
  location?: string,
  languageCodes?: string[]
): Promise<SeedKeywordsResult> {
  if (isUsingMockData()) {
    await new Promise((r) => setTimeout(r, 300));
    return { keywords: generateMockSeedKeywords(seeds), source: "mock" };
  }

  // Check cache (include primary language in cache key)
  const primaryLang = languageCodes?.[0] ?? "en";
  const cacheKey = [...seeds].sort().join(",") + `|${primaryLang}`;
  const cached = getCached<SeedKeyword[]>("seed", cacheKey, location);
  if (cached) return { keywords: cached, source: "live" };

  try {
    // Always fetch English first
    const enResults = await fetchFromDataForSEO(seeds, location, "en");

    // If location has a non-English primary language and English results are sparse,
    // fetch in the local language too and merge
    const localLang = languageCodes?.find((l) => l !== "en");
    let merged = enResults;

    if (localLang && enResults.filter((k) => k.search_volume > 0).length < 15) {
      try {
        console.log(`[DataForSEO Seeds] English results sparse (${enResults.filter(k => k.search_volume > 0).length} with volume), fetching ${localLang} keywords...`);
        const localResults = await fetchFromDataForSEO(seeds, location, localLang);

        // Merge: add local-language keywords not already found in English results
        const existingKeywords = new Set(enResults.map((k) => k.keyword.toLowerCase()));
        const newKeywords = localResults.filter(
          (k) => !existingKeywords.has(k.keyword.toLowerCase()) && k.search_volume > 0
        );

        if (newKeywords.length > 0) {
          console.log(`[DataForSEO Seeds] Added ${newKeywords.length} ${localLang} keywords`);
          merged = selectMixedKeywords([...enResults, ...newKeywords]);
        }
      } catch (localError) {
        console.warn(`[DataForSEO Seeds] ${localLang} fetch failed, using English only:`, classifyError(localError).message);
      }
    }

    setCache("seed", cacheKey, location, merged);
    return { keywords: merged, source: "live" };
  } catch (error) {
    const classified = classifyError(error);
    console.error(`[DataForSEO Seeds] ${classified.type}: ${classified.message}`);

    if (shouldRetry(error)) {
      await new Promise((r) => setTimeout(r, 2000));
      try {
        const results = await fetchFromDataForSEO(seeds, location, "en");
        setCache("seed", cacheKey, location, results);
        return { keywords: results, source: "live" };
      } catch (retryError) {
        console.error("[DataForSEO Seeds] Retry failed:", classifyError(retryError).message);
      }
    }

    console.warn("[DataForSEO Seeds] Falling back to mock data.");
    return { keywords: generateMockSeedKeywords(seeds), source: "mock" };
  }
}
