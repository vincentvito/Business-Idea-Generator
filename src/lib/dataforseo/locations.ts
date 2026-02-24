import { isUsingMockData } from "./client";

// ─── Types ───

export interface LocationEntry {
  code: number;
  name: string;       // short name, e.g. "Dubai"
  fullName: string;    // e.g. "Dubai,United Arab Emirates"
  type: string;        // "Country", "City", "State", "Region", etc.
  countryCode: string; // ISO country code, e.g. "AE"
  parentCode: number | null;
}

interface RawLocationResult {
  location_code: number;
  location_name: string;
  location_code_parent: number | null;
  country_iso_code: string;
  location_type: string;
}

// ─── In-memory cache ───

interface LocationDB {
  byNameLower: Map<string, LocationEntry[]>;
  byCode: Map<number, LocationEntry>;
  cities: LocationEntry[];   // filtered to City type, sorted by name for search
  all: LocationEntry[];
}

let db: LocationDB | null = null;
let loadPromise: Promise<LocationDB> | null = null;

// Language mapping: location_code → available language codes (for keywords API)
let langMap: Map<number, string[]> | null = null;
let langLoadPromise: Promise<Map<number, string[]>> | null = null;

const USEFUL_TYPES = new Set(["Country", "City", "State", "Region", "Province", "Territory"]);

// ─── Fetch from DataForSEO (free endpoint) ───

async function fetchLocationsFromAPI(): Promise<LocationEntry[]> {
  const login = process.env.DATAFORSEO_LOGIN!;
  const password = process.env.DATAFORSEO_PASSWORD!;
  const auth = Buffer.from(`${login}:${password}`).toString("base64");

  const response = await fetch("https://api.dataforseo.com/v3/keywords_data/google/locations", {
    method: "GET",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Locations API failed: HTTP ${response.status}`);
  }

  const data = await response.json();
  const results: RawLocationResult[] = data.tasks?.[0]?.result ?? [];

  return results
    .filter((r) => USEFUL_TYPES.has(r.location_type))
    .map((r) => {
      // location_name is "City,Country" or just "Country"
      const parts = r.location_name.split(",");
      const name = parts[0].trim();
      return {
        code: r.location_code,
        name,
        fullName: r.location_name,
        type: r.location_type,
        countryCode: r.country_iso_code,
        parentCode: r.location_code_parent,
      };
    });
}

// ─── Fetch language mapping from DataForSEO (free endpoint) ───

interface RawLanguageLocationResult {
  location_code: number;
  available_languages: {
    language_name: string;
    language_code: string;
    keywords: boolean;
    serps: boolean;
  }[];
}

async function fetchLanguagesFromAPI(): Promise<Map<number, string[]>> {
  const login = process.env.DATAFORSEO_LOGIN!;
  const password = process.env.DATAFORSEO_PASSWORD!;
  const auth = Buffer.from(`${login}:${password}`).toString("base64");

  const response = await fetch("https://api.dataforseo.com/v3/keywords_data/google_ads/locations_and_languages", {
    method: "GET",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Locations & Languages API failed: HTTP ${response.status}`);
  }

  const data = await response.json();
  const results: RawLanguageLocationResult[] = data.tasks?.[0]?.result ?? [];

  const map = new Map<number, string[]>();
  for (const r of results) {
    const langs = (r.available_languages ?? [])
      .filter((l) => l.keywords)
      .map((l) => l.language_code);
    if (langs.length > 0) {
      // Put English first if present, then the rest
      const sorted = langs.sort((a, b) => {
        if (a === "en") return -1;
        if (b === "en") return 1;
        return 0;
      });
      map.set(r.location_code, sorted);
    }
  }

  return map;
}

async function ensureLanguagesLoaded(): Promise<Map<number, string[]>> {
  if (langMap) return langMap;

  if (!langLoadPromise) {
    langLoadPromise = (async () => {
      if (isUsingMockData()) {
        const empty = new Map<number, string[]>();
        langMap = empty;
        return empty;
      }

      try {
        console.log("[Locations] Fetching language mapping from DataForSEO...");
        const map = await fetchLanguagesFromAPI();
        console.log(`[Locations] Loaded languages for ${map.size} locations`);
        langMap = map;
        return map;
      } catch (error) {
        console.error("[Locations] Failed to load language mapping:", error);
        const empty = new Map<number, string[]>();
        langMap = empty;
        return empty;
      }
    })();
  }

  return langLoadPromise;
}

// ─── Build index ───

function buildIndex(entries: LocationEntry[]) {
  const byNameLower = new Map<string, LocationEntry[]>();
  const byCode = new Map<number, LocationEntry>();

  for (const entry of entries) {
    byCode.set(entry.code, entry);

    const key = entry.name.toLowerCase();
    const existing = byNameLower.get(key) ?? [];
    existing.push(entry);
    byNameLower.set(key, existing);

    // Also index the full name for "City,Country" format matching
    const fullKey = entry.fullName.toLowerCase();
    if (fullKey !== key) {
      const existingFull = byNameLower.get(fullKey) ?? [];
      existingFull.push(entry);
      byNameLower.set(fullKey, existingFull);
    }
  }

  const cities = entries
    .filter((e) => e.type === "City")
    .sort((a, b) => a.name.localeCompare(b.name));

  return { byNameLower, byCode, cities, all: entries };
}

// ─── Lazy loading ───

async function ensureLoaded() {
  if (db) return db;

  if (!loadPromise) {
    loadPromise = (async () => {
      if (isUsingMockData()) {
        // No API credentials — return empty DB (will fall back to static dict)
        const empty = buildIndex([]);
        db = empty;
        return empty;
      }

      try {
        console.log("[Locations] Fetching location database from DataForSEO...");
        const entries = await fetchLocationsFromAPI();
        console.log(`[Locations] Loaded ${entries.length} locations (${new Set(entries.filter(e => e.type === "City").map(e => e.countryCode)).size} countries with cities)`);
        const built = buildIndex(entries);
        db = built;
        return built;
      } catch (error) {
        console.error("[Locations] Failed to load location database:", error);
        const empty = buildIndex([]);
        db = empty;
        return empty;
      }
    })();
  }

  return loadPromise;
}

// ─── Common aliases for cities ───

const ALIASES: Record<string, string> = {
  "nyc": "new york",
  "new york city": "new york",
  "la": "los angeles",
  "sf": "san francisco",
  "dc": "washington",
  "washington dc": "washington",
  "philly": "philadelphia",
  "chi-town": "chicago",
  "vegas": "las vegas",
  "nola": "new orleans",
};

// ─── Public API ───

/**
 * Resolves a user-entered location string to a DataForSEO location entry.
 * Uses the comprehensive location database (~95k locations) fetched from DataForSEO.
 * Tries multiple matching strategies in order of specificity.
 */
export async function resolveLocation(input: string): Promise<LocationEntry | null> {
  const loaded = await ensureLoaded();
  const normalized = input.toLowerCase().trim();

  if (!normalized) return null;

  // 1. Exact full name match: "Dubai,United Arab Emirates"
  const exactFull = loaded.byNameLower.get(normalized);
  if (exactFull?.length === 1) return exactFull[0];
  if (exactFull && exactFull.length > 1) {
    // Prefer City over other types
    const city = exactFull.find((e) => e.type === "City");
    if (city) return city;
    return exactFull[0];
  }

  // 2. Parse "City, Country" input format
  const parts = normalized.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const cityPart = parts[0];
    const countryPart = parts.slice(1).join(",").trim();

    // Find cities matching the city name
    const cityMatches = loaded.byNameLower.get(cityPart)?.filter((e) => e.type === "City") ?? [];

    if (cityMatches.length > 0) {
      // Try to match country part against the fullName or countryCode
      const countryLower = countryPart.toLowerCase();
      const refined = cityMatches.find((e) =>
        e.fullName.toLowerCase().includes(countryLower) ||
        e.countryCode.toLowerCase() === countryLower
      );
      if (refined) return refined;
      // If no country match, return the first city match
      return cityMatches[0];
    }

    // Try country part as a standalone match
    const countryMatch = loaded.byNameLower.get(countryPart);
    if (countryMatch) {
      const country = countryMatch.find((e) => e.type === "Country");
      if (country) return country;
    }
  }

  // 3. Direct name match (city name like "Dubai", "Bangkok")
  const nameMatch = loaded.byNameLower.get(normalized);
  if (nameMatch) {
    const city = nameMatch.find((e) => e.type === "City");
    if (city) return city;
    const country = nameMatch.find((e) => e.type === "Country");
    if (country) return country;
    return nameMatch[0];
  }

  // 4. Alias lookup
  const alias = ALIASES[normalized];
  if (alias) {
    const aliasMatch = loaded.byNameLower.get(alias);
    if (aliasMatch) {
      const city = aliasMatch.find((e) => e.type === "City");
      if (city) return city;
      return aliasMatch[0];
    }
  }

  // 5. Prefix match (e.g., "New York" matching "New York,United States")
  for (const [key, entries] of loaded.byNameLower) {
    if (key.startsWith(normalized + ",") || key.startsWith(normalized + " ")) {
      const city = entries.find((e) => e.type === "City");
      if (city) return city;
      return entries[0];
    }
  }

  return null;
}

/**
 * Search locations by query string for autocomplete.
 * Returns up to `limit` matching locations, prioritizing cities.
 */
export async function searchLocations(query: string, limit = 10): Promise<LocationEntry[]> {
  const loaded = await ensureLoaded();
  const q = query.toLowerCase().trim();

  if (!q || q.length < 2) return [];

  const results: LocationEntry[] = [];
  const seen = new Set<number>();

  // Exact name matches first
  const exact = loaded.byNameLower.get(q);
  if (exact) {
    for (const e of exact) {
      if (!seen.has(e.code)) {
        results.push(e);
        seen.add(e.code);
      }
    }
  }

  // Prefix matches on city names
  for (const city of loaded.cities) {
    if (results.length >= limit) break;
    if (seen.has(city.code)) continue;
    if (city.name.toLowerCase().startsWith(q)) {
      results.push(city);
      seen.add(city.code);
    }
  }

  // Prefix matches on countries
  if (results.length < limit) {
    for (const entry of loaded.all) {
      if (results.length >= limit) break;
      if (seen.has(entry.code)) continue;
      if (entry.type === "Country" && entry.name.toLowerCase().startsWith(q)) {
        results.push(entry);
        seen.add(entry.code);
      }
    }
  }

  // Substring matches on cities (if we still need more)
  if (results.length < limit) {
    for (const city of loaded.cities) {
      if (results.length >= limit) break;
      if (seen.has(city.code)) continue;
      if (city.name.toLowerCase().includes(q)) {
        results.push(city);
        seen.add(city.code);
      }
    }
  }

  return results.slice(0, limit);
}

/**
 * Returns available language codes for a given location.
 * English ("en") is always first if available. Returns ["en"] as fallback.
 */
export async function getLanguagesForLocation(locationCode: number): Promise<string[]> {
  const map = await ensureLanguagesLoaded();
  const langs = map.get(locationCode);
  if (langs && langs.length > 0) return langs;
  return ["en"];
}

/**
 * Pre-warm the location database. Call at server startup or on first request.
 * Non-blocking — returns immediately, loads in background.
 */
export function preloadLocations(): void {
  ensureLoaded().catch(() => {});
  ensureLanguagesLoaded().catch(() => {});
}
