import { NextRequest, NextResponse } from "next/server";
import { searchLocations } from "@/lib/dataforseo/locations";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json([]);
  }

  const results = await searchLocations(q, 10);

  return NextResponse.json(
    results.map((r) => ({
      name: r.name,
      fullName: r.fullName,
      code: r.code,
      type: r.type,
      country: r.countryCode,
    }))
  );
}
