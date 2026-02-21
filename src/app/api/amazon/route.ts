import { NextRequest } from "next/server";
import { fetchAmazonData } from "@/lib/dataforseo/amazon";

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
    const amazon = await fetchAmazonData(keywords, location);
    return Response.json({ amazon });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to fetch Amazon data",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
