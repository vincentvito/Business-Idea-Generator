import { isUsingMockData, dataforseoRequest, getLocationCode } from "./client";
import { classifyError } from "./errors";
import { getCached, setCache } from "./cache";
import type { LocalCompetitorDetail } from "@/types/validation";
import type { GoogleBusinessInfoResult } from "./types";

// ─── Deterministic hash for mock data ───

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    h = (h << 5) - h + char;
    h |= 0;
  }
  return Math.abs(h);
}

// ─── Mock data ───

function generateMockBusinessDetail(
  name: string,
  location: string
): LocalCompetitorDetail {
  const seed = hash(`${name}:${location}`.toLowerCase());
  const rating = Math.round((3.5 + (seed % 15) / 10) * 10) / 10;
  const reviews = 50 + (seed % 950);

  return {
    name,
    rating,
    reviews_count: reviews,
    rating_distribution: {
      "1": Math.round(reviews * 0.05),
      "2": Math.round(reviews * 0.05),
      "3": Math.round(reviews * 0.1),
      "4": Math.round(reviews * 0.3),
      "5": Math.round(reviews * 0.5),
    },
    address: `${100 + (seed % 900)} ${location} Ave`,
    phone: `+1-555-${String(seed % 10000).padStart(4, "0")}`,
    url: `https://www.${name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
    category: "Restaurant",
    additional_categories: ["Food", "Takeout"],
    price_level: ["$", "$$", "$$$"][seed % 3],
    total_photos: 20 + (seed % 180),
    is_claimed: true,
    attributes: {
      "Service options": ["Dine-in", "Takeout", "Delivery"],
      Accessibility: ["Wheelchair accessible entrance"],
    },
    popular_times: null,
  };
}

// ─── Live API ───

async function fetchFromDataForSEO(
  businessName: string,
  location?: string
): Promise<LocalCompetitorDetail | null> {
  const locationCode = location ? getLocationCode(location) : null;

  const task = {
    keyword: businessName,
    ...(locationCode ? { location_code: locationCode } : {}),
    language_code: "en",
  };

  const response = await dataforseoRequest<GoogleBusinessInfoResult>(
    "business_data/google/my_business_info/live",
    [task]
  );

  const result = response.tasks?.[0]?.result?.[0];
  if (!result?.items || result.items.length === 0) {
    console.warn("[DataForSEO Business] No info for:", businessName);
    return null;
  }

  const item = result.items[0];
  return {
    name: item.title,
    rating: item.rating?.value ?? 0,
    reviews_count: item.rating?.votes_count ?? 0,
    rating_distribution: item.rating?.rating_distribution ?? null,
    address: item.address ?? "",
    phone: item.phone,
    url: item.url,
    category: item.category,
    additional_categories: item.additional_categories ?? [],
    price_level: item.price_level,
    total_photos: item.total_photos ?? 0,
    is_claimed: item.is_claimed ?? false,
    attributes: item.attributes,
    popular_times: item.popular_times,
  };
}

// ─── Public API ───

/**
 * Fetch detailed Google Business info for a list of businesses.
 * Cost-controlled: only fetches top 3 businesses (this endpoint is more expensive).
 * Sequential fetching to limit concurrent API calls.
 */
export async function fetchBusinessDetails(
  businessNames: string[],
  location?: string
): Promise<LocalCompetitorDetail[]> {
  const topNames = businessNames.slice(0, 3);

  if (isUsingMockData()) {
    await new Promise((r) => setTimeout(r, 300));
    return topNames.map((name) =>
      generateMockBusinessDetail(name, location ?? "global")
    );
  }

  const results: LocalCompetitorDetail[] = [];

  for (const name of topNames) {
    const cached = getCached<LocalCompetitorDetail>("biz", name, location);
    if (cached) {
      results.push(cached);
      continue;
    }

    try {
      const detail = await fetchFromDataForSEO(name, location);
      if (detail) {
        setCache("biz", name, location, detail);
        results.push(detail);
      }
    } catch (error) {
      console.error(
        `[DataForSEO Business] ${name}:`,
        classifyError(error).message
      );
      results.push(generateMockBusinessDetail(name, location ?? "global"));
    }
  }

  return results;
}
