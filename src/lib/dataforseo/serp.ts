import { isUsingMockData, dataforseoRequest, getLocationCode } from "./client";
import { classifyError } from "./errors";
import { getCached, setCache } from "./cache";
import type { CompetitorData } from "@/types/validation";
import type { SerpOrganicResult } from "./types";

// ─── Mock data ───

function generateMockSerpResults(query: string): CompetitorData[] {
  const words = query.split(" ");
  const baseDomain = words[0]?.toLowerCase() ?? "example";

  return Array.from({ length: 5 }, (_, i) => ({
    position: i + 1,
    title: `${query} - Top Provider ${i + 1}`,
    url: `https://www.${baseDomain}${i > 0 ? i + 1 : ""}.com`,
    domain: `www.${baseDomain}${i > 0 ? i + 1 : ""}.com`,
    snippet: `Leading provider of ${query.toLowerCase()}. We offer premium services tailored to your needs. Established in ${2015 + i}. Serving customers with excellence.`,
    displayed_link: `www.${baseDomain}${i > 0 ? i + 1 : ""}.com`,
    sitelinks: i < 2 ? 4 : 0,
    rich_snippet: i === 0,
    date: null,
    featured_snippet: i === 0,
  }));
}

// ─── Live API ───

async function fetchFromDataForSEO(
  query: string,
  location?: string
): Promise<CompetitorData[]> {
  const locationCode = location ? getLocationCode(location) : null;

  const task = {
    keyword: query,
    ...(locationCode ? { location_code: locationCode } : {}),
    language_code: "en",
    device: "desktop",
    os: "windows",
    depth: 10,
  };

  const response = await dataforseoRequest<SerpOrganicResult>(
    "serp/google/organic/live/regular",
    [task]
  );

  const result = response.tasks?.[0]?.result?.[0];
  if (!result?.items) {
    console.warn("[DataForSEO SERP] API returned no items for:", query);
    return generateMockSerpResults(query);
  }

  // Filter only organic results
  const organicItems = result.items.filter((item) => item.type === "organic");

  return organicItems.slice(0, 10).map((item, index) => ({
    position: index + 1,
    title: item.title,
    url: item.url,
    domain: item.domain,
    snippet: item.description,
    displayed_link: item.breadcrumb || item.domain,
    sitelinks: item.links?.length ?? 0,
    rich_snippet: item.highlighted != null && item.highlighted.length > 0,
    date: null,
    featured_snippet: item.is_featured_snippet,
  }));
}

// ─── Public API ───

export async function fetchSerpCompetitors(
  keywords: string[],
  location?: string
): Promise<CompetitorData[]> {
  // Search top 2-3 keywords to limit cost
  const topKeywords = keywords.slice(0, 3);

  if (isUsingMockData()) {
    await new Promise((r) => setTimeout(r, 300));
    const all = topKeywords.flatMap(generateMockSerpResults);
    return deduplicateByDomain(all).slice(0, 5);
  }

  // Check cache
  const cachedResults: CompetitorData[] = [];
  const uncachedKeywords: string[] = [];

  for (const kw of topKeywords) {
    const hit = getCached<CompetitorData[]>("serp", kw, location);
    if (hit) {
      cachedResults.push(...hit);
    } else {
      uncachedKeywords.push(kw);
    }
  }

  try {
    const freshResults: CompetitorData[] = [];
    // Run SERP queries in parallel
    const results = await Promise.all(
      uncachedKeywords.map((kw) => fetchFromDataForSEO(kw, location))
    );

    for (let i = 0; i < uncachedKeywords.length; i++) {
      const kw = uncachedKeywords[i];
      const data = results[i];
      setCache("serp", kw, location, data);
      freshResults.push(...data);
    }

    const all = [...cachedResults, ...freshResults];
    return deduplicateByDomain(all).slice(0, 5);
  } catch (error) {
    console.error("[DataForSEO SERP]", classifyError(error).message);
    console.warn("[DataForSEO SERP] Falling back to mock data.");
    const all = topKeywords.flatMap(generateMockSerpResults);
    return deduplicateByDomain(all).slice(0, 5);
  }
}

function deduplicateByDomain(competitors: CompetitorData[]): CompetitorData[] {
  const seen = new Set<string>();
  return competitors.filter((c) => {
    if (seen.has(c.domain)) return false;
    seen.add(c.domain);
    return true;
  });
}
