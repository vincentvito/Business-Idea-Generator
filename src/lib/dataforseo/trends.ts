import { isUsingMockData, dataforseoRequest, getLocationCode } from "./client";
import { classifyError } from "./errors";
import { getCached, setCache } from "./cache";
import type { TrendData } from "@/types/validation";
import type { TrendsExploreResult } from "./types";

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

function generateMockTrends(keywords: string[]): TrendData[] {
  return keywords.map((kw) => {
    const seed = hash(kw.toLowerCase());
    const baseValue = 40 + (seed % 40);
    // Simulate a rising/stable/declining trend
    const trendType = seed % 3; // 0=rising, 1=stable, 2=declining

    const timeline: { date: string; value: number }[] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      let trendOffset = 0;
      if (trendType === 0) trendOffset = (12 - i) * 2; // rising
      else if (trendType === 2) trendOffset = -(12 - i) * 1.5; // declining
      const noise = ((hash(`${kw}${i}`) % 10) - 5);
      const value = Math.max(0, Math.min(100, Math.round(baseValue + trendOffset + noise)));
      timeline.push({
        date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
        value,
      });
    }

    const firstValue = timeline[0].value;
    const lastValue = timeline[timeline.length - 1].value;
    const growthPercentage = firstValue > 0
      ? Math.round(((lastValue - firstValue) / firstValue) * 100)
      : 0;

    let trend_direction: TrendData["trend_direction"] = "stable";
    if (growthPercentage > 10) trend_direction = "rising";
    else if (growthPercentage < -10) trend_direction = "declining";

    return { keyword: kw, timeline, trend_direction, growth_percentage: growthPercentage };
  });
}

// ─── Live API ───

async function fetchFromDataForSEO(
  keywords: string[],
  location?: string
): Promise<TrendData[]> {
  const locationCode = location ? getLocationCode(location) : null;

  // Google Trends supports up to 5 keywords per request
  const task = {
    keywords,
    ...(locationCode ? { location_code: locationCode } : {}),
    language_code: "en",
    type: "web",
    time_range: "past_12_months",
  };

  const response = await dataforseoRequest<TrendsExploreResult>(
    "keywords_data/google_trends/explore/live",
    [task]
  );

  const result = response.tasks?.[0]?.result?.[0];
  if (!result?.items) {
    console.warn("[DataForSEO Trends] API returned no items for:", keywords);
    return generateMockTrends(keywords);
  }

  return result.items.map((item) => {
    const timeline = item.data.map((dp) => ({
      date: dp.date_from.slice(0, 7), // "YYYY-MM"
      value: dp.values?.[0] ?? dp.value ?? 0,
    }));

    const firstValue = timeline[0]?.value ?? 0;
    const lastValue = timeline[timeline.length - 1]?.value ?? 0;
    const growthPercentage = firstValue > 0
      ? Math.round(((lastValue - firstValue) / firstValue) * 100)
      : 0;

    let trend_direction: TrendData["trend_direction"] = "stable";
    if (growthPercentage > 10) trend_direction = "rising";
    else if (growthPercentage < -10) trend_direction = "declining";

    return {
      keyword: item.keyword,
      timeline,
      trend_direction,
      growth_percentage: growthPercentage,
    };
  });
}

// ─── Public API ───

export async function fetchTrendData(
  keywords: string[],
  location?: string
): Promise<TrendData[]> {
  // Trends API supports up to 5 keywords per request
  const topKeywords = keywords.slice(0, 5);

  if (isUsingMockData()) {
    await new Promise((r) => setTimeout(r, 300));
    return generateMockTrends(topKeywords);
  }

  // Check cache first
  const cached: TrendData[] = [];
  const uncached: string[] = [];

  for (const kw of topKeywords) {
    const hit = getCached<TrendData>("trend", kw, location);
    if (hit) {
      cached.push(hit);
    } else {
      uncached.push(kw);
    }
  }

  if (uncached.length === 0) return cached;

  try {
    const fresh = await fetchFromDataForSEO(uncached, location);
    for (const t of fresh) {
      setCache("trend", t.keyword, location, t);
    }
    return [...cached, ...fresh];
  } catch (error) {
    console.error("[DataForSEO Trends]", classifyError(error).message);
    console.warn("[DataForSEO Trends] Falling back to mock data.");
    return generateMockTrends(topKeywords);
  }
}
