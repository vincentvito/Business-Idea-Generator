import { isUsingMockData, dataforseoRequest } from "@/lib/dataforseo/client";
import { classifyError } from "@/lib/dataforseo/errors";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("keyword") || "pizza delivery";
  const location = searchParams.get("location_code") || "2840";

  if (isUsingMockData()) {
    return Response.json(
      { error: "DataForSEO is in mock mode. Set DATAFORSEO_LOGIN in .env.local." },
      { status: 503 }
    );
  }

  try {
    const response = await dataforseoRequest(
      "keywords_data/google_ads/search_volume/live",
      [{
        keywords: [keyword],
        language_code: "en",
        location_code: parseInt(location, 10),
      }]
    );

    return Response.json({
      status: "ok",
      cost: response.cost,
      task_status: {
        code: response.tasks?.[0]?.status_code,
        message: response.tasks?.[0]?.status_message,
      },
      result_count: response.tasks?.[0]?.result_count,
      raw_results: response.tasks?.[0]?.result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const classified = classifyError(error);
    return Response.json(
      {
        status: "error",
        error_type: classified.type,
        error_message: classified.message,
        retryable: classified.retryable,
        raw_error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
