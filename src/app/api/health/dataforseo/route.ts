import { isUsingMockData } from "@/lib/dataforseo/client";
import { getCacheStats } from "@/lib/dataforseo/cache";

export async function GET() {
  const isMock = isUsingMockData();

  const cache = getCacheStats();

  return Response.json(
    {
      status: "ok",
      mode: isMock ? "mock" : "live",
      credentials: {
        login: isMock ? "not configured" : "configured",
      },
      cache,
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
