import { NextRequest } from "next/server";
import { fetchSerpCompetitors } from "@/lib/dataforseo/serp";

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
    const competitors = await fetchSerpCompetitors(keywords, location);
    return Response.json({ competitors });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to fetch competitors",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
