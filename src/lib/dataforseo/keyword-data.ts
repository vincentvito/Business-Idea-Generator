import { isUsingMockData, dataforseoRequest, getLocationCode } from "./client";
import { classifyError, shouldRetry } from "./errors";
import { getCached, setCache } from "./cache";
import type { KeywordMetrics } from "@/types/validation";
import type { SearchVolumeResult } from "./types";

export interface KeywordMetricsResult {
  metrics: KeywordMetrics[];
  source: "mock" | "live";
}

// ─── Mock data generation (deterministic, same pattern as the old Google Ads mock) ───

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    h = (h << 5) - h + char;
    h |= 0;
  }
  return Math.abs(h);
}

function generateMockMetrics(keywords: string[]): KeywordMetrics[] {
  return keywords.map((kw) => {
    const seed = hash(kw.toLowerCase());
    const volume = ((seed % 50000) + 100) * (kw.split(" ").length > 2 ? 1 : 3);
    const compIdx = seed % 100;
    const cpcLow = ((seed % 500) + 50) / 100;
    const cpcHigh = cpcLow + ((seed % 300) + 100) / 100;

    // Generate 24 months of mock search history
    const monthlySearches: { year: number; month: number; search_volume: number }[] = [];
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const seasonalVariance = 1 + 0.2 * Math.sin((date.getMonth() / 12) * Math.PI * 2);
      monthlySearches.push({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        search_volume: Math.round(volume * seasonalVariance * (0.8 + (hash(`${kw}${i}`) % 40) / 100)),
      });
    }

    return {
      keyword: kw,
      avg_monthly_searches: volume,
      competition: compIdx < 33 ? "LOW" : compIdx < 66 ? "MEDIUM" : "HIGH",
      competition_index: compIdx,
      low_top_of_page_bid: Math.round(cpcLow * 100) / 100,
      high_top_of_page_bid: Math.round(cpcHigh * 100) / 100,
      monthly_searches: monthlySearches,
      cpc: Math.round(((cpcLow + cpcHigh) / 2) * 100) / 100,
    };
  });
}

// ─── Live API fetch ───

/**
 * Extracts a field from a DataForSEO result, checking both flat and
 * keyword_info-nested locations (API format varies by version/endpoint).
 */
function getField<T>(r: SearchVolumeResult, field: string): T | undefined {
  // Try flat first (current v3 format), then nested
  const flat = (r as unknown as Record<string, unknown>)[field];
  if (flat !== undefined && flat !== null) return flat as T;
  const nested = (r.keyword_info as Record<string, unknown> | undefined)?.[field];
  if (nested !== undefined && nested !== null) return nested as T;
  return undefined;
}

/**
 * Resolves competition_index to a 0-100 integer from whichever field is available.
 * - competition_index: already 0-100 integer (flat format)
 * - competition: could be 0-1 float (nested format) or a string (flat format)
 */
function resolveCompetitionIndex(r: SearchVolumeResult): number {
  // Prefer competition_index (already 0-100)
  const idx = getField<number>(r, "competition_index");
  if (typeof idx === "number") return Math.round(idx);

  // Fall back to competition if it's a number (0-1 float in nested format)
  const comp = getField<number | string>(r, "competition");
  if (typeof comp === "number") {
    return comp <= 1 ? Math.round(comp * 100) : Math.round(comp);
  }

  return 0;
}

/**
 * Resolves competition level string from whichever field is available.
 */
function resolveCompetitionLevel(r: SearchVolumeResult): "LOW" | "MEDIUM" | "HIGH" | "UNSPECIFIED" {
  // Flat format: competition is the string
  const comp = getField<string>(r, "competition");
  if (typeof comp === "string" && ["LOW", "MEDIUM", "HIGH"].includes(comp)) {
    return comp as "LOW" | "MEDIUM" | "HIGH";
  }
  // Nested format: competition_level is the string
  const level = getField<string>(r, "competition_level");
  if (typeof level === "string" && ["LOW", "MEDIUM", "HIGH"].includes(level)) {
    return level as "LOW" | "MEDIUM" | "HIGH";
  }
  return "UNSPECIFIED";
}

async function fetchFromDataForSEO(
  keywords: string[],
  location?: string
): Promise<KeywordMetrics[]> {
  const locationCode = location ? getLocationCode(location) : null;

  const task = {
    keywords,
    ...(locationCode ? { location_code: locationCode } : {}),
    language_code: "en",
    search_partners: false,
    sort_by: "relevance",
  };

  const response = await dataforseoRequest<SearchVolumeResult>(
    "keywords_data/google_ads/search_volume/live",
    [task]
  );

  const taskInfo = response.tasks?.[0];
  console.log(
    "[DataForSEO Keywords] Task status:", taskInfo?.status_code,
    taskInfo?.status_message, "result_count:", taskInfo?.result_count
  );

  const results = taskInfo?.result ?? [];
  if (results.length > 0) {
    console.log("[DataForSEO Keywords] Sample result:", JSON.stringify(results[0]));
  } else {
    console.warn("[DataForSEO Keywords] API returned 0 results for:", keywords.slice(0, 5),
      "task result:", JSON.stringify(taskInfo?.result));
  }

  const monthlySearches = (r: SearchVolumeResult) => {
    const ms = getField<{ year: number; month: number; search_volume: number }[]>(r, "monthly_searches");
    return (ms ?? []).map((m) => ({
      year: m.year,
      month: m.month,
      search_volume: m.search_volume,
    }));
  };

  return results.map((r) => ({
    keyword: r.keyword,
    avg_monthly_searches: getField<number>(r, "search_volume") ?? 0,
    competition: resolveCompetitionLevel(r),
    competition_index: resolveCompetitionIndex(r),
    low_top_of_page_bid: getField<number>(r, "low_top_of_page_bid") ?? 0,
    high_top_of_page_bid: getField<number>(r, "high_top_of_page_bid") ?? 0,
    monthly_searches: monthlySearches(r),
    cpc: getField<number>(r, "cpc") ?? 0,
  }));
}

// ─── Public API ───

export async function fetchKeywordMetrics(
  keywords: string[],
  location?: string
): Promise<KeywordMetricsResult> {
  if (isUsingMockData()) {
    await new Promise((r) => setTimeout(r, 500));
    return { metrics: generateMockMetrics(keywords), source: "mock" };
  }

  // Split into cached and uncached
  const cached: KeywordMetrics[] = [];
  const uncachedKeywords: string[] = [];

  for (const kw of keywords) {
    const hit = getCached<KeywordMetrics>("kw", kw, location);
    if (hit) {
      cached.push(hit);
    } else {
      uncachedKeywords.push(kw);
    }
  }

  if (uncachedKeywords.length === 0) {
    return { metrics: cached, source: "live" };
  }

  try {
    const fresh = await fetchFromDataForSEO(uncachedKeywords, location);
    for (const m of fresh) {
      setCache("kw", m.keyword, location, m);
    }
    return { metrics: [...cached, ...fresh], source: "live" };
  } catch (error) {
    const classified = classifyError(error);
    console.error(`[DataForSEO Keywords] ${classified.type}: ${classified.message}`);

    if (shouldRetry(error)) {
      await new Promise((r) => setTimeout(r, 2000));
      try {
        const fresh = await fetchFromDataForSEO(uncachedKeywords, location);
        for (const m of fresh) {
          setCache("kw", m.keyword, location, m);
        }
        return { metrics: [...cached, ...fresh], source: "live" };
      } catch (retryError) {
        console.error("[DataForSEO Keywords] Retry failed:", classifyError(retryError).message);
      }
    }

    console.warn("[DataForSEO Keywords] Falling back to mock data.");
    return { metrics: generateMockMetrics(keywords), source: "mock" };
  }
}

export async function fetchBatchKeywordMetrics(
  keywordGroups: { ideaId: number; keywords: string[] }[],
  location?: string
): Promise<{ metricsMap: Map<number, KeywordMetrics[]>; source: "mock" | "live" }> {
  const allKeywords = keywordGroups.flatMap((g) => g.keywords);

  const { metrics: allMetrics, source } = await fetchKeywordMetrics(allKeywords, location);

  const metricsLookup = new Map<string, KeywordMetrics>();
  for (const m of allMetrics) {
    metricsLookup.set(m.keyword.toLowerCase(), m);
  }

  const metricsMap = new Map<number, KeywordMetrics[]>();
  for (const group of keywordGroups) {
    const metrics = group.keywords
      .map((kw) => metricsLookup.get(kw.toLowerCase()))
      .filter((m): m is KeywordMetrics => m !== undefined);
    metricsMap.set(group.ideaId, metrics);
  }

  return { metricsMap, source };
}
