import { NextRequest } from "next/server";
import { fetchTrendData } from "@/lib/dataforseo/trends";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { keywords, location } = body;

  if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
    return new Response(
      JSON.stringify({ error: "Please provide an array of keywords" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const trends = await fetchTrendData(keywords, location);
    return Response.json({ trends });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to fetch trend data",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
