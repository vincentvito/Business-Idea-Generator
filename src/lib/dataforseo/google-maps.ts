import { isUsingMockData, dataforseoRequest, getLocationCode } from "./client";
import { classifyError, shouldRetry } from "./errors";
import { getCached, setCache } from "./cache";
import type { LocalCompetitorData, LocalCompetitionData } from "@/types/validation";
import type { GoogleMapsResult } from "./types";

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

const MOCK_NAMES = [
  "Bella Cucina", "Golden Wok", "The Hungry Goat", "Fire & Smoke BBQ",
  "Green Leaf Kitchen", "Pasta Paradise", "Sushi Station", "The Rustic Table",
  "Spice Route", "Baker's Dozen", "Ocean Blue Seafood", "Farm & Fork",
  "The Daily Grind", "Sweet Surrender Bakery", "Noodle House",
  "The Olive Branch", "Taco Libre", "Urban Harvest", "The Pho House",
  "Craft & Crust Pizzeria",
];

const MOCK_CATEGORIES = [
  "Restaurant", "Fast food restaurant", "Pizza restaurant",
  "Coffee shop", "Bakery", "Bar", "Cafe", "Sandwich shop",
  "Seafood restaurant", "Italian restaurant", "Mexican restaurant",
  "Asian restaurant", "Burger restaurant", "Ice cream shop",
];

function generateMockMapResults(
  foodType: string,
  location: string
): LocalCompetitionData {
  const seed = hash(`${foodType}:${location}`.toLowerCase());
  const competitorCount = 5 + (seed % 16); // 5-20

  const competitors: LocalCompetitorData[] = Array.from(
    { length: Math.min(competitorCount, 20) },
    (_, i) => {
      const nameSeed = hash(`${foodType}${i}`);
      return {
        name: MOCK_NAMES[nameSeed % MOCK_NAMES.length] + (i > 0 ? ` #${i + 1}` : ""),
        rating: Math.round((3.0 + (hash(`${foodType}r${i}`) % 20) / 10) * 10) / 10,
        reviews_count: 10 + (hash(`${foodType}v${i}`) % 990),
        address: `${100 + i * 10} ${location} Street`,
        phone: null,
        category: MOCK_CATEGORIES[hash(`${foodType}c${i}`) % MOCK_CATEGORIES.length],
        price_level: ["$", "$$", "$$$"][hash(`${foodType}p${i}`) % 3],
        url: null,
        latitude: null,
        longitude: null,
        is_claimed: hash(`${foodType}cl${i}`) % 3 !== 0,
      };
    }
  );

  return buildCompetitionData(foodType, location, competitors, competitorCount);
}

// ─── Helpers ───

function classifySaturation(
  count: number
): LocalCompetitionData["saturation_level"] {
  if (count <= 5) return "low";
  if (count <= 10) return "moderate";
  if (count <= 15) return "high";
  return "very_high";
}

function classifyRatings(competitors: LocalCompetitorData[]) {
  const rated = competitors.filter((c) => c.rating > 0);
  return {
    excellent: rated.filter((c) => c.rating >= 4.5).length,
    good: rated.filter((c) => c.rating >= 4.0 && c.rating < 4.5).length,
    average: rated.filter((c) => c.rating >= 3.0 && c.rating < 4.0).length,
    poor: rated.filter((c) => c.rating < 3.0).length,
  };
}

function buildCompetitionData(
  query: string,
  location: string,
  competitors: LocalCompetitorData[],
  totalCount: number
): LocalCompetitionData {
  const ratings = competitors.filter((c) => c.rating > 0).map((c) => c.rating);
  const reviews = competitors.map((c) => c.reviews_count);

  return {
    query,
    location,
    total_competitors: totalCount,
    avg_rating:
      ratings.length > 0
        ? Math.round((ratings.reduce((s, r) => s + r, 0) / ratings.length) * 10) / 10
        : 0,
    avg_reviews:
      reviews.length > 0
        ? Math.round(reviews.reduce((s, r) => s + r, 0) / reviews.length)
        : 0,
    rating_distribution: classifyRatings(competitors),
    top_competitors: competitors.slice(0, 10),
    detailed_competitors: [],
    saturation_level: classifySaturation(totalCount),
  };
}

// ─── Live API ───

async function fetchFromDataForSEO(
  query: string,
  location?: string
): Promise<LocalCompetitionData> {
  const locationCode = location ? getLocationCode(location) : null;

  const task = {
    keyword: query,
    ...(locationCode ? { location_code: locationCode } : {}),
    language_code: "en",
    depth: 20, // Cost control: 20 instead of default 100
  };

  const response = await dataforseoRequest<GoogleMapsResult>(
    "serp/google/maps/live/advanced",
    [task]
  );

  const result = response.tasks?.[0]?.result?.[0];
  if (!result?.items || result.items.length === 0) {
    console.warn("[DataForSEO Maps] API returned 0 items for:", query);
    return generateMockMapResults(query, location ?? "global");
  }

  const competitors: LocalCompetitorData[] = result.items
    .filter((item) => item.type === "maps_search")
    .map((item) => ({
      name: item.title,
      rating: item.rating?.value ?? 0,
      reviews_count: item.rating?.votes_count ?? 0,
      address: item.address ?? "",
      phone: item.phone,
      category: item.category,
      price_level: item.price_level,
      url: item.url,
      latitude: item.latitude,
      longitude: item.longitude,
      is_claimed: item.is_claimed ?? false,
    }));

  return buildCompetitionData(
    query,
    location ?? "global",
    competitors,
    result.items_count ?? competitors.length
  );
}

// ─── Public API ───

export async function fetchLocalCompetitors(
  foodType: string,
  location: string
): Promise<LocalCompetitionData> {
  const query = `${foodType} ${location}`;

  if (isUsingMockData()) {
    await new Promise((r) => setTimeout(r, 400));
    return generateMockMapResults(foodType, location);
  }

  const cached = getCached<LocalCompetitionData>("maps", query, location);
  if (cached) return cached;

  try {
    const data = await fetchFromDataForSEO(query, location);
    setCache("maps", query, location, data);
    return data;
  } catch (error) {
    const classified = classifyError(error);
    console.error(`[DataForSEO Maps] ${classified.type}: ${classified.message}`);

    if (shouldRetry(error)) {
      await new Promise((r) => setTimeout(r, 2000));
      try {
        const data = await fetchFromDataForSEO(query, location);
        setCache("maps", query, location, data);
        return data;
      } catch (retryError) {
        console.error(
          "[DataForSEO Maps] Retry failed:",
          classifyError(retryError).message
        );
      }
    }

    console.warn("[DataForSEO Maps] Falling back to mock data.");
    return generateMockMapResults(foodType, location);
  }
}
