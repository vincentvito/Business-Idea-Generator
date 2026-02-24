import type { DataForSEOResponse } from "./types";

const BASE_URL = "https://api.dataforseo.com/v3";

export function isUsingMockData(): boolean {
  return (
    !process.env.DATAFORSEO_LOGIN ||
    process.env.DATAFORSEO_LOGIN === "MOCK"
  );
}

export async function dataforseoRequest<T>(
  endpoint: string,
  body: unknown[]
): Promise<DataForSEOResponse<T>> {
  const login = process.env.DATAFORSEO_LOGIN!;
  const password = process.env.DATAFORSEO_PASSWORD!;
  const auth = Buffer.from(`${login}:${password}`).toString("base64");

  const response = await fetch(`${BASE_URL}/${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new DataForSEOError(
      `HTTP ${response.status}: ${text}`,
      response.status
    );
  }

  const data: DataForSEOResponse<T> = await response.json();

  // Validate task-level status — DataForSEO returns HTTP 200 even when
  // the task itself fails (e.g. endpoint not in plan, invalid params).
  const task = data.tasks?.[0];
  if (task && task.status_code !== 20000 && task.status_code !== 20100) {
    throw new DataForSEOError(
      `Task error ${task.status_code}: ${task.status_message}`,
      task.status_code
    );
  }

  return data;
}

export class DataForSEOError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = "DataForSEOError";
  }
}

// ─── Location code mapping ───
// Static fallback dictionary for when the comprehensive location DB hasn't loaded yet.
// The dynamic DB (see locations.ts) covers ~95k locations worldwide via DataForSEO's free API.

const STATIC_LOCATION_CODES: Record<string, number> = {
  "united states": 2840,
  usa: 2840,
  us: 2840,
  "united kingdom": 2826,
  uk: 2826,
  italy: 2380,
  milan: 1008463,
  rome: 1008055,
  dubai: 9041082,
  uae: 2784,
  "united arab emirates": 2784,
  germany: 2276,
  berlin: 1003854,
  france: 2250,
  paris: 1006094,
  canada: 2124,
  toronto: 1002289,
  australia: 2036,
  sydney: 1000286,
  singapore: 2702,
  japan: 2392,
  tokyo: 1009293,
  india: 2356,
  mumbai: 1007768,
  brazil: 2076,
  "são paulo": 1001773,
  "sao paulo": 1001773,
  netherlands: 2528,
  amsterdam: 1010543,
  sweden: 2752,
  stockholm: 1011005,
  "new york": 1023191,
  "los angeles": 1013962,
  london: 1006886,
  spain: 2724,
  madrid: 1005493,
  barcelona: 1005493,
};

/**
 * Synchronous location code lookup using the static fallback dictionary.
 * Used by non-pipeline code (SERP, trends, etc.) that needs sync access.
 * For comprehensive matching (~95k locations), use resolveLocation() from locations.ts.
 */
export function getLocationCode(location: string): number | null {
  const normalized = location.toLowerCase().trim();
  if (STATIC_LOCATION_CODES[normalized]) return STATIC_LOCATION_CODES[normalized];

  // Try "City, Country" format
  const city = normalized.split(",")[0].trim();
  if (STATIC_LOCATION_CODES[city]) return STATIC_LOCATION_CODES[city];

  const country = normalized.split(",").slice(1).join(",").trim();
  if (country && STATIC_LOCATION_CODES[country]) return STATIC_LOCATION_CODES[country];

  return null;
}
