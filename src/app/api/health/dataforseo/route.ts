import { isUsingMockData, dataforseoRequest } from "@/lib/dataforseo/client";
import { classifyError } from "@/lib/dataforseo/errors";
import { getCacheStats } from "@/lib/dataforseo/cache";

export async function GET() {
  const isMock = isUsingMockData();
  const cache = getCacheStats();

  if (isMock) {
    return Response.json(
      {
        status: "mock",
        mode: "mock",
        credentials: { login: "not configured" },
        api_test: null,
        cache,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  }

  // Make a real API call to verify credentials + endpoint access
  let apiTest: { success: boolean; message: string; cost?: number; sample?: unknown };

  try {
    const response = await dataforseoRequest(
      "keywords_data/google_ads/search_volume/live",
      [{ keywords: ["test"], language_code: "en", location_code: 2840 }]
    );
    const task = response.tasks?.[0];
    const result = task?.result?.[0];
    apiTest = {
      success: true,
      message: `API responded OK. Task status: ${task?.status_code} ${task?.status_message}`,
      cost: response.cost,
      sample: result
        ? { keyword: (result as Record<string, unknown>).keyword, search_volume: (result as Record<string, unknown>).search_volume }
        : null,
    };
  } catch (error) {
    const classified = classifyError(error);
    apiTest = {
      success: false,
      message: `${classified.type}: ${classified.message}`,
    };
  }

  return Response.json(
    {
      status: apiTest.success ? "ok" : "error",
      mode: "live",
      credentials: { login: "configured" },
      api_test: apiTest,
      cache,
      timestamp: new Date().toISOString(),
    },
    { status: apiTest.success ? 200 : 503 }
  );
}
